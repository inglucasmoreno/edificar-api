const chalk = require('chalk');
const {error, success} = require('../helpers/response');
const Producto = require('../models/producto.model');
const Ingreso = require('../models/ingreso_producto.model');

// Listar ingresos
const listarIngresos = async (req, res) => {
    try{
        // Ordenar
        let ordenar = [ req.query.columna || 'createdAt', req.query.direccion || 1 ];

        // Paginación
        const desde = Number(req.query.desde) || 0;
        const limit = Number(req.query.limit) || 0;

        // Filtrado
        const busqueda = {};
        let filtroOR = [];
        
        const fDescripcion = req.query.descripcion || '';
        const fEstado = req.query.estado || '';
        
        // Filtro estado
        if(fEstado) busqueda.estado = fEstado;

        // Filtro OR
        if(fDescripcion){
            const descripcion = new RegExp(fDescripcion, 'i'); // Expresion regular para busqueda insensible
            filtroOR.push({razon_social_proveedor: descripcion});
            filtroOR.push({numero_remito: descripcion});
            filtroOR.push({cuit_proveedor: descripcion});
        }else{
            filtroOR.push({}); // Todos los resultados
        }

        const [ ingresos, total ] = await Promise.all([
            Ingreso.find(busqueda)
                        .or(filtroOR)
                        .sort([ordenar])
                        .skip(desde)
                        .limit(limit),
            Ingreso.find(busqueda)
                        .or(filtroOR)
                        .sort([ordenar])
                        .countDocuments()
        ]);

        success(res, { ingresos, total });

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Nuevo remito de ingreso (sin productos) 
const nuevoIngreso = async (req, res) => {
    try{
        const { cuit_proveedor, numero_remito } = req.body;
        
        // Se verifica si el ingreso no esta repetido (CUIT y numero de remito)
        const ingresoRepetido = await Ingreso.findOne({ numero_remito, cuit_proveedor });
        if(ingresoRepetido) return error(res, 400, 'El número de remito esta repetido');

        // Se crea el remito de ingreso
        const ingreso = new Ingreso(req.body);
        const resultado = await ingreso.save();
        success(res, { ingreso: resultado });

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

module.exports = {
    listarIngresos,
    nuevoIngreso
}