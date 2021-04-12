const chalk = require('chalk');
const mongoose = require('mongoose');
const {error, success} = require('../helpers/response');
const Producto = require('../models/producto.model');
const Ingreso = require('../models/ingreso.model');
const Trazabilidad = require('../models/trazabilidad.model');
const IngresoProducto = require('../models/ingreso_productos.model');

// Nuevo producto -> Ingreso
const nuevoProducto = async (req, res) => {
    try{
        const {ingreso, producto, cantidad} = req.body;

        // Se verifica si el ingreso existe
        const ingresoExiste = await Ingreso.findById(ingreso);
        if(!ingresoExiste) return error(res, 400, 'El ingreso no existe');

        // Se verifica si el producto existe
        const productoExiste = await Producto.findById(producto);
        if(!productoExiste) return error(res, 400, 'El producto no existe');

        // Se verifica si el producto no esta repetido en el ingreso
        const productoRepetido = await IngresoProducto.findOne({ingreso, producto, activo: true });
        if(productoRepetido) return error(res, 400, 'El producto ya esta en el ingreso');

        // La cantidad debe ser mayor que 0
        if(Number(cantidad) < 0) return error(res, 400, 'La cantidad debe ser un numero mayor a 0');

        const nuevoProducto = new IngresoProducto(req.body);
        const resultado = await nuevoProducto.save();
        success(res, { resultado });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500)
    }
}

// Listar productos por Ingreso
const listarPorIngreso = async (req, res) => {
    try{
        const ingreso = req.params.id;

        // Variables de busqueda
        const busqueda = {};
        let pipeline = [];

        // Etapa 1 - Filtrar por Ingreso
        pipeline.push({$match: { ingreso: mongoose.Types.ObjectId(ingreso) }});
        busqueda['ingreso'] = ingreso;

        // Etapa 2 - Filtrado por activo/inactivo
        if(req.query.activo == 'true'){
            pipeline.push({$match: { activo: true }});
            busqueda['activo'] = true;
        }else if(req.query.activo == 'false'){
            pipeline.push({$match: { activo: false }}); 
            busqueda['activo'] = false;
        }

        // Etapa 3 - LookUp - Ingreso
        pipeline.push(
            { $lookup: { 
                from: 'ingresos',
                localField: 'ingreso',
                foreignField: '_id',
                as: 'ingreso'
            }},
        );
        pipeline.push({ $unwind: '$ingreso' });

        // Etapa 4 - LookUp - Producto
        pipeline.push(
            { $lookup: { // Lookup - Producto
                from: 'productos',
                localField: 'producto',
                foreignField: '_id',
                as: 'producto'
            }},
        );
        pipeline.push({ $unwind: '$producto' });

        // Etapa 5 - LookUp - Producto -> Unidad de medida
        pipeline.push(
            { $lookup: { // Lookup - Producto
                from: 'unidad_medida',
                localField: 'producto.unidad_medida',
                foreignField: '_id',
                as: 'producto.unidad_medida'
            }},
        );
        pipeline.push({ $unwind: '$producto.unidad_medida' });

        // Etapa 6 - Ordenando datos
        const ordenar = {};
        if(req.query.columna){
            ordenar[req.query.columna] = Number(req.query.direccion); 
            pipeline.push({$sort: ordenar});
        }

        // Etapa 7 -  Paginación
        const desde = req.query.desde ? Number(req.query.desde) : 0;
        const limit = req.query.limit ? Number(req.query.limit) : 0;       
        if(limit != 0) pipeline.push({$limit: limit});
        pipeline.push({$skip: desde});

        // Se obtienen los datos
        const [productos, total, totalGeneral] = await Promise.all([
            IngresoProducto.aggregate(pipeline),
            IngresoProducto.find(busqueda).countDocuments(),
            IngresoProducto.find({ingreso}).countDocuments()
        ]);

        success(res, { productos, total, totalGeneral });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Ingreso parcial de producto
const ingresoParcial = async (req, res) => {
    try{

        const id = req.params.id;

        // Se verifica si el producto en el ingreos existe
        const productoIngresoDB = await IngresoProducto.findById(id);
        if(!productoIngresoDB) return error(res, 400, 'El producto no existe en el ingreso');

        // Datos de producto antes de actualizacion
        const { producto, cantidad, ingreso } = productoIngresoDB;
        const productoAnterior = await Producto.findById(producto, 'cantidad');
        if(!productoAnterior) return error(res, 400, 'El producto no existe')

        // Se impacta sobre el stock
        const productoActualizado = await Producto.findByIdAndUpdate(productoIngresoDB.producto, { $inc: { cantidad: productoIngresoDB.cantidad} }, { new: true });
        
        // Se impacta sobre la trazabilidad
        const { documento_codigo, persona_empresa } = req.body;

        const dataTrazabilidad = {
            producto,
            cantidad,
            tipo: 'Ingreso',
            stock_anterior: productoAnterior.cantidad,
            stock_nuevo: productoActualizado.cantidad,
            documento: ingreso,
            documento_codigo,
            persona_empresa 
        }

        const trazabilidad = Trazabilidad(dataTrazabilidad);
        await trazabilidad.save();

        // Se actualiza el estado y la fecha del producto en ingreso
        const resultado = await IngresoProducto.findByIdAndUpdate(id, {activo: false, fecha_ingreso: Date.now() });

        success(res, { resultado });

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Eliminar producto de ingreso
const eliminarProducto = async (req, res) => {
    try{

        const id = req.params.id;

        // Se verifica que el producto existe
        const productoExiste = await IngresoProducto.findById(id);
        if(!productoExiste) return error(res, 400, 'El producto no existe');

        // Se eliminar el producto del ingreso
        const producto = await IngresoProducto.findByIdAndRemove(id);
        success(res, producto);  
    
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}


// Completar igreso
const completarIngreso = async (req, res) => {

    try{

        const ingreso = req.params.id;

        // Se buscan los productos que faltan ingresar
        const productos_ingreso = await IngresoProducto.find({ ingreso, activo: true }, 'producto cantidad');
                    
        const { documento_codigo, persona_empresa } = req.body;

        // Se opera sobre cada producto de forma individual
        productos_ingreso.forEach( async elemento => {

            // Info de producto antes de la actualizacion
            const productoAnterior = await Producto.findById(elemento.producto, 'cantidad');
            if(!productoAnterior) return error(res, 400, 'El producto no existe')
            
            // Se impacta sobre el stock
            const productoActualizado = await Producto.findByIdAndUpdate(elemento.producto, { $inc: { cantidad: elemento.cantidad } }, { new: true });
            
            // Se actualiza el estado y la fecha del producto en ingreso   
            await IngresoProducto.findByIdAndUpdate(elemento._id, {activo: false, fecha_ingreso: Date.now() });  
            
            // Se impacata sobre la trazabilidad                   
            const dataTrazabilidad = {
                producto: elemento.producto,
                cantidad: elemento.cantidad,
                tipo: 'Ingreso',
                stock_anterior: productoAnterior.cantidad, //
                stock_nuevo: productoActualizado.cantidad,
                documento: ingreso,
                documento_codigo,
                persona_empresa 
            }
    
            const trazabilidad = Trazabilidad(dataTrazabilidad);
            await trazabilidad.save();

        });

        // Se completa el ingreso
        const resultado = await Ingreso.findByIdAndUpdate(ingreso, { estado: 'Completado', activo: false, fecha_ingreso: Date.now() });

        success(res, { resultado });

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }

}

module.exports = {
    nuevoProducto,
    listarPorIngreso,
    ingresoParcial,
    eliminarProducto,
    completarIngreso,
}

