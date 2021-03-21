const chalk = require('chalk');
const {error, success} = require('../helpers/response');
const Producto = require('../models/producto.model');
const Egreso = require('../models/egreso_producto.model');


// Listar egresos
const listarEgresos = async (req, res) => {
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
        const fCodigo = req.query.codigo || '';
        const fEstado = req.query.estado || '';

        // Filtro estado
        if(fEstado) busqueda.estado = fEstado;
        
        // Filtro codigo
        if(fCodigo) busqueda.codigo = fCodigo;

        // Filtro OR
        if(fDescripcion){
            const descripcion = new RegExp(fDescripcion, 'i'); // Expresion regular para busqueda insensible
            filtroOR.push({descripcion_cliente: descripcion});
            filtroOR.push({tipo_identificacion_cliente: descripcion});
            filtroOR.push({identificacion_cliente: descripcion});
        }else{
            filtroOR.push({}); // Todos los resultados
        }

        const [ egresos, total ] = await Promise.all([
            Egreso.find(busqueda)
                        .or(filtroOR)
                        .sort([ordenar])
                        .skip(desde)
                        .limit(limit),
            Egreso.find(busqueda)
                        .or(filtroOR)
                        .sort([ordenar])
                        .countDocuments()
        ]);

        success(res, { egresos, total });

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Nueva nota de venta (Sin productos)
const nuevoEgreso = async (req, res) => {
    try{
        
        // Generacion de codigo de venta
        const egresosDB = await Egreso.find().sort({createdAt: -1});
        const ultimoEgreso = egresosDB[0];

        if(!ultimoEgreso) req.body.codigo = '0';
        else req.body.codigo = Number(ultimoEgreso.codigo) + 1;

        // Se crea el documento de egreso
        const egreso = new Egreso(req.body);
        const resultado = await egreso.save();
        success(res, { egreso: resultado });

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

module.exports = {
    listarEgresos,
    nuevoEgreso
}