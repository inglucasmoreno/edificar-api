const chalk = require('chalk');
const mongoose = require('mongoose');
const {error, success} = require('../helpers/response');
const Producto = require('../models/producto.model');
const Egreso = require('../models/egreso.model');
const EgresoProducto = require('../models/egreso_productos.model');

// Nuevo producto -> Egreso
const nuevoProducto = async (req, res) => {
    try{
        const {egreso, producto, cantidad} = req.body;

         // Se verifica si el egreso existe
         const egresoExiste = await Egreso.findById(egreso);
         if(!egresoExiste) return error(res, 400, 'El egreso no existe');
 
         // Se verifica si el producto existe
         const productoExiste = await Producto.findById(producto);
         if(!productoExiste) return error(res, 400, 'El producto no existe');
 
         // La cantidad debe ser un numero
         if(typeof(cantidad) != 'number') return error(res, 400, 'La cantidad debe ser un numero');
 
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

        // Etapa 2 - LookUp - Ingreso
        pipeline.push(
            { $lookup: { 
                from: 'egresos',
                localField: 'egreso',
                foreignField: '_id',
                as: 'egreso'
            }},
        );
        pipeline.push({ $unwind: '$egreso' });

        // Etapa 3 - LookUp - Producto
        pipeline.push(
            { $lookup: { // Lookup - Producto
                from: 'productos',
                localField: 'producto',
                foreignField: '_id',
                as: 'producto'
            }},
        );
        pipeline.push({ $unwind: '$producto' });

        // Etapa 4 - LookUp - Producto -> Unidad de medida
        pipeline.push(
            { $lookup: { // Lookup - Producto
                from: 'unidad_medida',
                localField: 'producto.unidad_medida',
                foreignField: '_id',
                as: 'producto.unidad_medida'
            }},
        );
        pipeline.push({ $unwind: '$producto.unidad_medida' });

         // Etapa 5 -  Paginación
         const desde = req.query.desde ? Number(req.query.desde) : 0;
         const limit = req.query.limit ? Number(req.query.limit) : 0;       
         if(limit != 0) pipeline.push({$limit: limit});
         pipeline.push({$skip: desde});

        // Etapa 6 - Ordenando datos
        const ordenar = {};
        if(req.query.columna){
            ordenar[req.query.columna] = Number(req.query.direccion); 
            pipeline.push({$sort: ordenar});
        }

        // Se obtienen los datos
        const [productos, total] = await Promise.all([
            EgresoProducto.aggregate(pipeline),
            EgresoProducto.find(busqueda).countDocuments()
        ]);

        success(res, { productos, total });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}


module.exports = {
    nuevoProducto,
    listarPorEgreso
}