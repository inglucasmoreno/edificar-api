const chalk = require('chalk');
const {error, success} = require('../helpers/response');
const RemitoEntrega = require('../models/remito_entrega.model');
const ProductosEgreso = require('../models/egreso_productos.model');
const Producto = require('../models/producto.model');
const RemitoProducto = require('../models/remito_entrega_productos.model');

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
        const { productos } = req.body;

        // Se crea remito de entrega
        const remitoEntrega = new RemitoEntrega(req.body);
        const remitoDB = await remitoEntrega.save();
        
        // -- SE ENTREGAN LOS PRODUCTOS --
        productos.forEach(async producto => {
            const productoDB = await ProductosEgreso.findById(producto.id);
        
            // Nuevo producto para remito de entrega
            const productoRemito = new RemitoProducto({
                remito_entrega: remitoDB._id,
                producto: producto.id,
                cantidad: producto.cantidad     
            });

            // Actualizacion de productos del egreso
            // Se entrega la totalidad del producto
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

            // Impacto sobre el stock y productos de remito
            await Promise.all([
                Producto.findByIdAndUpdate(productoDB.producto, {
                    $inc: { cantidad: -producto.cantidad} 
                }),
                productoRemito.save()
            ]);     
        });

        success(res, 'Actualizacion correcta');    
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Se crea un nueva entrega
const nuevoRemitoEntrega = async (req, res) => {
    const hoy = Date.now();
    try{

        const egreso = req.body.egreso;

        // Se crea remito de entrega
        const remitoEntrega = new RemitoEntrega(req.body);
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
            
            // Actualizacion de productos del egreso, impacto sobre el stock y productos de remito
            await Promise.all([
                ProductosEgreso.findByIdAndUpdate(producto._id, {
                    cantidad_restante: 0,
                    cantidad_entregada: producto.cantidad,
                    fecha_egreso: hoy,
                    activo: false
                }),
                Producto.findByIdAndUpdate(producto.producto, {
                    $inc: { cantidad: -producto.cantidad_restante} 
                }),
                productoRemito.save()
            ]);
        })
        success(res, 'Actualizacion correcta');
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

module.exports = {
    listarRemitosPorEgreso,
    entregaParcial,
    nuevoRemitoEntrega
}




