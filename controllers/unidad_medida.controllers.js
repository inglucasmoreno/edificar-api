const chalk = require('chalk');
const {error, success} = require('../helpers/response');
const UnidadMedida = require('../models/unidad_medida.model');

// Nueva unidad de medida
const nuevaUnidad = async (req, res) => {
    try{
        const unidad = UnidadMedida(req.body);
        const resultado = await unidad.save();
        success(res, { unidad: resultado });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Unidad por ID
const getUnidad = async (req, res) => {
    try{
        const unidad = await UnidadMedida.findById(req.params.id);
        if(!unidad) return error(res, 400, 'La unidad no existe');
        success(res, { unidad });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Listar unidades de medida
const listarUnidades = async (req, res) => {
    try{
        // Ordenar
        let ordenar = [ req.query.columna || 'descripcion', req.query.direccion || 1 ];

        // Paginación
        const desde = Number(req.query.desde) || 0;
        const limit = Number(req.query.limit) || 0;

        // Filtrado
        const busqueda = {};
        const fParametro = req.query.parametro || '';
        const fActivo = req.query.activo || '';
        if(fActivo) busqueda.activo = fActivo;
        if(fParametro){
            const parametro = new RegExp(fParametro, 'i'); // Expresion regular para busqueda insensible
            busqueda.descripcion = parametro;
        }

        const unidades = await UnidadMedida.find(busqueda)
                                           .sort([ordenar])
                                           .skip(desde)
                                           .limit(limit)
        success(res, { unidades });    
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Actualizar unidad de medida
const actualizarUnidad = async (req, res) => {
    try{
        const { id } = req.params;
        let unidad = UnidadMedida.findById(id);
        if(!unidad) return error(res, 400, 'La unidad no existe');
        unidad = await UnidadMedida.findByIdAndUpdate(id, req.body, { new: true });
        success(res, { unidad })
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}


module.exports = {
    nuevaUnidad,
    getUnidad,
    listarUnidades,
    actualizarUnidad
}