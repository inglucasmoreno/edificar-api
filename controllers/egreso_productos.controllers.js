const chalk = require('chalk');
const mongoose = require('mongoose');
const {error, success} = require('../helpers/response');
const Producto = require('../models/producto.model');
const Egreso = require('../models/egreso.model');
const Trazabilidad = require('../models/trazabilidad.model');

const EgresoProducto = require('../models/egreso_productos.model');

// Nuevo producto -> Egreso
const nuevoProducto = async (req, res) => {
    try{
        const {egreso, producto, cantidad} = req.body;

        // Cantidad restante de entrega
        req.body.cantidad_restante = cantidad;

        // Se verifica si el egreso existe
        const egresoExiste = await Egreso.findById(egreso);
        if(!egresoExiste) return error(res, 400, 'El egreso no existe');

        // Se verifica si el producto existe
        const productoExiste = await Producto.findById(producto);
        if(!productoExiste) return error(res, 400, 'El producto no existe');

        // Se verifica si el producto no esta repetido en el egreso
        const productoRepetido = await EgresoProducto.findOne({egreso , producto, activo: true });
        if(productoRepetido) return error(res, 400, 'El producto ya esta en el egreso');

        // La cantidad debe ser mayor que 0
        if(cantidad < 0) return error(res, 400, 'La cantidad debe ser un numero mayor a 0');

        const nuevoProducto = new EgresoProducto(req.body);
        const resultado = await nuevoProducto.save();
        success(res, { resultado });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Listar productos por Egreso
const listarPorEgreso = async (req, res) => {
    try{
        const { egreso } = req.params;

        // Variables de busqueda
        const busqueda = {};
        let pipeline = [];

        // Etapa 1 - Filtrar por Ingreso
        pipeline.push({$match: { egreso: mongoose.Types.ObjectId(egreso) }});
        busqueda['egreso'] = egreso;

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
                from: 'egresos',
                localField: 'egreso',
                foreignField: '_id',
                as: 'egreso'
            }},
        );
        pipeline.push({ $unwind: '$egreso' });

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
            EgresoProducto.aggregate(pipeline),
            EgresoProducto.find(busqueda).countDocuments(),
            EgresoProducto.find({ egreso }).countDocuments()
        ]);
        
        success(res, { productos, total, totalGeneral });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Ingreso parcial de producto
const egresoParcial = async (req, res) => {
    try{

        const id = req.params.id;

        // Se verifica si el producto existe
        const productoEgresoDB = await EgresoProducto.findById(id);
        if(!productoEgresoDB) return error(res, 400, 'El producto no existe');

        const {producto, cantidad, egreso} = productoEgresoDB;

        // Info de producto antes de actualizacion
        const productoAnterior = await Producto.findById(producto, 'cantidad');
        if(!productoAnterior) return error(res, 400, 'El producto no existe');

        // Se impacta sobre el stock
        const productoActualizado = await Producto.findByIdAndUpdate(productoEgresoDB.producto, { $inc: { cantidad: -productoEgresoDB.cantidad} }, {new: true});

        // Se impacta sobre la trazabilidad
        const { documento_codigo, persona_empresa } = req.body;

        const dataTrazabilidad = {
            producto,
            cantidad,
            tipo: 'Egreso',
            stock_anterior: productoAnterior.cantidad,
            stock_nuevo: productoActualizado.cantidad,
            documento: egreso,
            documento_codigo,
            persona_empresa 
        }

        const trazabilidad = Trazabilidad(dataTrazabilidad);
        await trazabilidad.save();

        // Se actualiza el estado y la fecha del producto en egreso
        const resultado = await EgresoProducto.findByIdAndUpdate(id, {activo: false, fecha_egreso: Date.now() });

        success(res, { resultado });

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Eliminar producto de egreso
const eliminarProducto = async (req, res) => {
    try{

        const id = req.params.id;
        
        // Se verifica que el producto existe
        const productoExiste = await EgresoProducto.findById(id);
        if(!productoExiste) return error(res, 400, 'El producto no existe');
        
        // Se eliminar el producto del egreso
        const producto = await EgresoProducto.findByIdAndRemove(id);
        success(res, producto);  
    
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Completar egreso
const completarEgreso = async (req, res) => {

    try{

        const egreso = req.params.id;

        // Se buscan los productos que faltan ingresar
        const productos_egreso = await EgresoProducto.find({ egreso, activo: true }, 'producto cantidad');
        if(productos_egreso.length !== 0) return error(res, 400, 'Debe entregar todos los productos')

        // Se impacta sobre la trazabilidad
        // const { documento_codigo, persona_empresa } = req.body;

        // Se completa el ingreso
        const resultado = await Egreso.findByIdAndUpdate(egreso, { estado: 'Completado', activo: false, fecha_egreso: Date.now() });

        success(res, { resultado });

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }

}


module.exports = {
    nuevoProducto,
    listarPorEgreso,
    egresoParcial,
    eliminarProducto,
    completarEgreso
}