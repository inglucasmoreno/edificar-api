const chalk = require('chalk');
const {error, success} = require('../helpers/response');
const Egreso = require('../models/egreso.model');

// Egreso por ID
const getEgreso = async (req, res) => {
    try{
        const { id } = req.params;
        const egreso = await Egreso.findById(id);
        if(!egreso) return error(res, 400, 'El egreso no existe');
        success(res, { egreso });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
};

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
        const fEstado = req.query.estado || '';

        // Filtro estado
        if(fEstado) busqueda.estado = fEstado;
        
        // Filtro OR
        if(fDescripcion){
            const descripcion = new RegExp(fDescripcion, 'i'); // Expresion regular para busqueda insensible
            filtroOR.push({descripcion_cliente: descripcion});
            filtroOR.push({codigo_cadena: descripcion});
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

// Actualizar egreso (No afecta a productos)
const actualizarEgreso = async (req, res) => {
    try{
        const { id } = req.params;
        const egresoBD = await Egreso.findById(id);
        if(!egresoBD) return error(res, 400, 'El egreso no existe');
        const egreso = await Egreso.findByIdAndUpdate(id, req.body);
        success(res, { egreso });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Nuevo egreso
const nuevoEgreso = async (req, res) => {
    try{
        
        // Generacion de codigo de venta
        const egresosDB = await Egreso.find().sort({createdAt: -1});
        const ultimoEgreso = egresosDB[0];
    
        if(!ultimoEgreso){
            req.body.codigo = '0';
            req.body.codigo_cadena = '00000000'
        }else{

            const nuevoCodigo = Number(ultimoEgreso.codigo) + 1; 
      
            // Se genera el codigo en formato string
            let codigo_cadena = String(nuevoCodigo);
            const repeticion = 8 - codigo_cadena.length;
            
            let i = 0;
            while(i < repeticion ){
                codigo_cadena = '0' + codigo_cadena;
                i++;
            }

            req.body.codigo = nuevoCodigo;    
            req.body.codigo_cadena = codigo_cadena;   
            
        } 
        
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
    getEgreso,
    listarEgresos,
    nuevoEgreso,
    actualizarEgreso
}