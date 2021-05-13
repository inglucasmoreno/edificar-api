const chalk = require('chalk');
const {error, success} = require('../helpers/response');
const RemitoEntrega = require('../models/remito_entrega.model');
const ProductosEgreso = require('../models/egreso_productos.model');
const Producto = require('../models/producto.model');
const RemitoProducto = require('../models/remito_entrega_productos.model');
const Trazabilidad = require('../models/trazabilidad.model');
const Egreso = require('../models/egreso.model');
const mongoose = require('mongoose');

// Se listan las entregas
const listarRemitosPorEgreso = async (req, res) => {
    try{
        const egreso = req.params.id;
        const remitos = await RemitoEntrega.find({ egreso }).sort({ createdAt: -1 });
        success(res, { remitos });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Entrega parcial de producto
const entregaParcial = async (req, res) => {
    const hoy = Date.now();
    try{
        // Datos del Body
        const { productos, egreso } = req.body;

        // Datos de egreso
        const egresoDB = await Egreso.findById(egreso);

        // Se genera el numero de remito
        let { punto_venta, nro_comprobante } = req.body 

        const  r_punto_venta = 4 - punto_venta.length;
        const  r_nro_comprobante = 8 - nro_comprobante.length;
        
        let i = 0;
        while(i < r_punto_venta){
            punto_venta = '0' + punto_venta;
            i++;
        }

        i = 0;
        while(i < r_nro_comprobante){
            nro_comprobante = '0' + nro_comprobante;
            i++;
        }

        const numero_remito = `${punto_venta}-${nro_comprobante}`; 
        
        const data = {numero_remito, egreso};

        // Creación - Remito de entrega
        const remitoEntrega = new RemitoEntrega(data);
        const remitoDB = await remitoEntrega.save();
        
        // -- SE ENTREGAN LOS PRODUCTOS --
        productos.forEach(async producto => {
            const productoDB = await ProductosEgreso.findById(producto.id);
        
            // Creación - Nuevo producto para remito
            const productoRemito = new RemitoProducto({
                remito_entrega: remitoDB._id,
                producto: productoDB.producto,
                cantidad: producto.cantidad     
            });

            // Si se entrega la totalidad del producto - Se pone Activo = false
            if(producto.cantidad == productoDB.cantidad_restante){
                await ProductosEgreso.findByIdAndUpdate(producto.id, {
                            cantidad_restante: 0,
                            cantidad_entregada: productoDB.cantidad,
                            fecha_egreso: hoy,
                            activo: false
                });
            // No se entrega la totalidad del producto    
            }else{
                await ProductosEgreso.findByIdAndUpdate(producto.id, {
                    cantidad_restante: productoDB.cantidad_restante - producto.cantidad,
                    cantidad_entregada: productoDB.cantidad_entregada + producto.cantidad,
                });    
            }

            // Producto base
            const productoBase = await Producto.findById(productoDB.producto);
            
            // Datos para trazabilidad
            const dataTrazabilidad = {
                producto: productoDB.producto,
                cantidad: producto.cantidad,
                tipo: 'Egreso',
                stock_anterior: productoBase.cantidad, // Nuevo  
                stock_nuevo: productoBase.cantidad - producto.cantidad,   // Nuevo stock
                documento: productoDB.egreso,
                persona_empresa: egresoDB.descripcion_cliente,
                documento_codigo: egresoDB.codigo_cadena
            }

            // Nuevo elemento para trazabilidad
            const trazabilidad = new Trazabilidad(dataTrazabilidad);

            // Impacto sobre el stock + productos de remito + trazabilidad
            await Promise.all([
                Producto.findByIdAndUpdate(productoDB.producto, { $inc: { cantidad: -producto.cantidad} }),
                productoRemito.save(),
                trazabilidad.save()
            ]);
                   
        });

        success(res, 'Actualizacion correcta');    
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Se crea una nueva entrega - Entrega total
const nuevoRemitoEntrega = async (req, res) => {
    const hoy = Date.now();
    try{

        const egreso = req.body.egreso;

        // Datos de egreso
        const egresoDB = await Egreso.findById(egreso);

        // Se genera el numero de remito
        let { punto_venta, nro_comprobante } = req.body 

        const  r_punto_venta = 4 - punto_venta.length;
        const  r_nro_comprobante = 8 - nro_comprobante.length;
        
        let i = 0;
        while(i < r_punto_venta){
            punto_venta = '0' + punto_venta;
            i++;
        }

        i = 0;
        while(i < r_nro_comprobante){
            nro_comprobante = '0' + nro_comprobante;
            i++;
        }

        const numero_remito = `${punto_venta}-${nro_comprobante}`; 
        
        const data = {numero_remito, egreso};

        // Creación - Nuevo remito de entrega
        const remitoEntrega = new RemitoEntrega(data);
        const remitoDB = await remitoEntrega.save();

        // -- SE ENTREGAN LOS PRODUCTOS --
        const productosEgreso = await ProductosEgreso.find({egreso, activo: true});
        productosEgreso.forEach(async producto => {
            
            // Nuevo producto para remito de entrega
            const productoRemito = new RemitoProducto({
                remito_entrega: remitoDB._id,
                producto: producto.producto,
                cantidad: producto.cantidad_restante      
            });

            // Producto base
            const productoBase = await Producto.findById(producto.producto);

            // Datos para trazabilidad
            const dataTrazabilidad = {
                producto: producto.producto,
                cantidad: producto.cantidad_restante,
                tipo: 'Egreso',
                stock_anterior: productoBase.cantidad, // Nuevo  
                stock_nuevo: productoBase.cantidad - producto.cantidad_restante,   // Nuevo stock
                documento: egreso,
                persona_empresa: egresoDB.descripcion_cliente,
                documento_codigo: egresoDB.codigo_cadena
            }
            
            // Nuevo elemento para trazabilidad
            const trazabilidad = new Trazabilidad(dataTrazabilidad);

            // Actualizacion de productos del egreso, impacto sobre el stock y productos de remito
            await Promise.all([
                Producto.findByIdAndUpdate(producto.producto, { $inc: { cantidad: -producto.cantidad_restante} }),
                ProductosEgreso.findByIdAndUpdate(producto._id, {
                    cantidad_restante: 0,
                    cantidad_entregada: producto.cantidad,
                    fecha_egreso: hoy,
                    activo: false
                }),
                productoRemito.save(),
                trazabilidad.save()
            ]);
        
        })
        success(res, 'Actualizacion correcta');
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Se traen los datos del remito
const getRemitoEntrega = async (req, res) => {
    try{
        const remito = await RemitoEntrega.findById(req.params.id);
        success(res, { remito });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Listar productos del remito 
const listarProductosRemito = async (req, res) => {
    try{

        let pipeline = [];

        // Etapa 1 - Filtro por remito
        pipeline.push({$match: {remito_entrega: mongoose.Types.ObjectId(req.params.id)}});
    
        // Etapa 2 - LookUp - Productos
        pipeline.push(
            { $lookup: { // Lookup - Producto
                from: 'productos',
                localField: 'producto',
                foreignField: '_id',
                as: 'producto'
            }},
        );
        pipeline.push({ $unwind: '$producto' });
        
        // Etapa 3 - LookUp - Producto -> Unidad de medida
        pipeline.push(
            { $lookup: { // Lookup - Producto
                from: 'unidad_medida',
                localField: 'producto.unidad_medida',
                foreignField: '_id',
                as: 'producto.unidad_medida'
            }},
        );
        pipeline.push({ $unwind: '$producto.unidad_medida' });
        
        // Etapa 4 - Ordenamiento
        pipeline.push({$sort: { 'producto.codigo': 1 }});

        
        const productos = await RemitoProducto.aggregate(pipeline);

        success(res, { productos });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

module.exports = {
    getRemitoEntrega,
    listarRemitosPorEgreso,
    listarProductosRemito,
    entregaParcial,
    nuevoRemitoEntrega
}




