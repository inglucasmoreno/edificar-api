const chalk = require('chalk');
const {error, success} = require('../helpers/response');
const UnidadMedida = require('../models/unidad_medida.model');
const Producto= require('../models/producto.model');

// Nueva unidad de medida
const nuevaUnidad = async (req, res) => {
    try{    
        // Se verifica si hay otra unidad con la misma descripcion
        const { descripcion } = req.body;
        const unidadExiste = await UnidadMedida.findOne({ descripcion: descripcion.toUpperCase() });

        if(unidadExiste) return error(res, 400, 'La unidad ya existe');
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
        const fDescripcion = req.query.descripcion || '';
        const fActivo = req.query.activo || '';
        if(fActivo) busqueda.activo = fActivo;
        if(fDescripcion){
            const descripcion = new RegExp(fDescripcion, 'i'); // Expresion regular para busqueda insensible
            busqueda.descripcion = descripcion;
        }

        const [ unidades, total ] = await Promise.all([
            UnidadMedida.find(busqueda)
                        .sort([ordenar])
                        .skip(desde)
                        .limit(limit),
            UnidadMedida.find(busqueda).countDocuments()
        ]);

        success(res, { unidades, total });    
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Actualizar unidad de medida
const actualizarUnidad = async (req, res) => {
    try{
        const { id } = req.params;
        const { activo, descripcion } = req.body;

        // Se verifica si la unidad de medida existe
        let unidad = await UnidadMedida.findById(id);
        if(!unidad) return error(res, 400, 'La unidad no existe');
        
        // Se verifica si la nueva unidad no esta registrada
        if(descripcion && unidad.descripcion != descripcion.toUpperCase()){
            const unidadExiste = await UnidadMedida.findOne({ descripcion: descripcion.toUpperCase() });
            if(unidadExiste) return error(res, 400, 'La unidad ya existe');
        }

        // Si se va a dar de baja - No debe haber producto asociado
        if(activo == false || activo == 'false'){
            const productoAsociado = await Producto.findOne({ unidad_medida: id, activo: true });
            if(productoAsociado) return error(res, 400, 'Existe un producto asociado a esta unidad');
        }
        
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