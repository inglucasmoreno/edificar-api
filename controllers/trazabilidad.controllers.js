const chalk = require('chalk');
const mongoose = require('mongoose');
const {error, success} = require('../helpers/response');
const moment = require('moment');

const Trazabilidad = require('../models/trazabilidad.model');

const listarTrazabilidad = async (req, res) => {
    try{

        const { producto, tipo, parametro, fechaAntes, fechaDespues } = req.query;

        const pipeline = [];
        const pipelineTotal = [];
        pipeline.push({$match: { }});
        pipelineTotal.push({$match: { }});

        // Etapa 1 - Filtrado por tipo
        if(tipo) {
            pipeline.push({$match: { tipo }});
            pipelineTotal.push({$match: { tipo }});
        } 
        
        // Etapa 2 - Filtrado por producto
        if(producto) {
            pipeline.push({$match: { producto: mongoose.Types.ObjectId(producto) }});
            pipelineTotal.push({$match: { producto: mongoose.Types.ObjectId(producto) }});
        } 

        console.log(new Date(fechaAntes));
        console.log(new Date(fechaDespues));

        // despues ------------------------------ Antes

        // Etapa 3 - Filtrado por fechas    
        if(fechaDespues){
            pipeline.push({$match: { createdAt: { $lte: new Date(fechaDespues) } }});
            pipelineTotal.push({$match: { createdAt: { $lte: new Date(fechaDespues) } }});
        }
       
        if(fechaAntes){
            pipeline.push({$match: { createdAt: { $gte: new Date(fechaAntes) } }});
            pipelineTotal.push({$match: { createdAt: { $gte: new Date(fechaAntes) } }});
        }


        // Etapa 4 - Filtrado por parametro
        if(parametro) {
            const descripcion = new RegExp(req.query.parametro, 'i'); // Expresion regular para busqueda insensible
            pipeline.push({$match: {persona_empresa: descripcion}});
            pipelineTotal.push({$match: {persona_empresa: descripcion}});
        } 
        
        // Etapa 5 - Join (Producto)     
        pipeline.push(
            { $lookup: { // Lookup - Tipos
                from: 'productos',
                localField: 'producto',
                foreignField: '_id',
                as: 'producto'
            }},
        );
        pipeline.push({ $unwind: '$producto' });
        
        const ordenar = {};    
        
        // Etapa 6 - Ordenando datos
        if(req.query.columna){
            ordenar[req.query.columna] = Number(req.query.direccion); 
            pipeline.push({$sort: ordenar});
        }

        // Etapa 7 -  Paginación
        const desde = req.query.desde ? Number(req.query.desde) : 0;
        const limit = req.query.limit ? Number(req.query.limit) : 0;       
        if(limit != 0) pipeline.push({$limit: limit});
        pipeline.push({$skip: desde});

        // Se genera la salida  
        const [trazabilidad, trazabilidadTotal] = await Promise.all([
            Trazabilidad.aggregate(pipeline),
            Trazabilidad.aggregate(pipelineTotal)
        ])
        
        const total = trazabilidadTotal.length;

        success(res, { trazabilidad, total });

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

module.exports = {
    listarTrazabilidad
}