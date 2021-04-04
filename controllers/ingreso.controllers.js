const chalk = require('chalk');
const {error, success} = require('../helpers/response');
const Ingreso = require('../models/ingreso.model');

// Ingreso por ID
const getIngreso = async (req, res) => {
    try{
        const { id } = req.params;
        const ingreso = await Ingreso.findById(id)
                                     .populate('proveedor')
                                    
        if(!ingreso) return error(res, 400, 'El ingreso no existe');
        success(res, { ingreso });    
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    } 
}

// Listar ingresos
const listarIngresos = async (req, res) => {
    try{

        // Filtrado
        let pipeline = [];
        let pipelineTotal = [];

        // Etapa 1 - Filtrado por estado
        if(req.query.estado){
            pipeline.push({$match: {estado: req.query.estado}});
            pipelineTotal.push({$match: {estado: req.query.estado}});
        }

        // Etapa 2 - Join (Proveedor)
        pipeline.push(
            { $lookup: { // Lookup - Tipos
                from: 'proveedores',
                localField: 'proveedor',
                foreignField: '_id',
                as: 'proveedor'
            }},
        );
        
        pipelineTotal.push(
            { $lookup: { // Lookup - Tipos
                from: 'proveedores',
                localField: 'proveedor',
                foreignField: '_id',
                as: 'proveedor'
            }},
        );

        pipeline.push({ $unwind: '$proveedor' });
        pipelineTotal.push({ $unwind: '$proveedor' });        

        // Etapa 3 - Filtrado por descripcion
        // - Numero de remito | Razon social de proveedor | CUIT de proveedor
        if(req.query.descripcion){
            const descripcion = new RegExp(req.query.descripcion, 'i'); // Expresion regular para busqueda insensible
            pipeline.push({$match: { $or: [{ numero_remito: descripcion }, { 'proveedor.razon_social' : descripcion }, {'proveedor.cuit': descripcion}] }});
            pipelineTotal.push({$match: { $or: [{ numero_remito: descripcion }, { 'proveedor.razon_social' : descripcion }, {'proveedor.cuit': descripcion}] }});
        }

        // Etapa 4 - Ordenando datos
        const ordenar = {};
        if(req.query.columna){
            ordenar[req.query.columna] = Number(req.query.direccion); 
            pipeline.push({$sort: ordenar});
        } 

        // Etapa 5 -  Paginación
        const desde = req.query.desde ? Number(req.query.desde) : 0;
        const limit = req.query.limit ? Number(req.query.limit) : 0;       
        if(limit != 0) pipeline.push({$limit: limit});
        pipeline.push({$skip: desde});

        const [ingresos, ingresosTotal] = await Promise.all([
            Ingreso.aggregate(pipeline),
            Ingreso.aggregate(pipelineTotal)
        ]);

        const total = ingresosTotal.length;
        success(res, { ingresos, total});

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Nuevo ingreso
const nuevoIngreso = async (req, res) => {
    try{
        const { proveedor } = req.body;
        let { punto_venta, nro_comprobante } = req.body;

        // Se genera el numero de remito
        const  r_punto_venta = 5 - punto_venta.length;
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
        const data = { numero_remito, proveedor };
        
        // Se verifica si el ingreso no esta repetido (CUIT y numero de remito)
        const ingresoRepetido = await Ingreso.findOne({ numero_remito, proveedor });
        if(ingresoRepetido) return error(res, 400, 'El número de remito esta repetido');

        // Se crea el remito de ingreso
        const ingreso = new Ingreso(data);
        const resultado = await ingreso.save();
        success(res, { ingreso: resultado });

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Actualizar ingreso
const actualizarIngreso = async (req, res) => {
    try{
        
        const { id } = req.params;
        const {numero_remito, proveedor} = req.body;
        const ingresoBD = await Ingreso.findById(id);
        if(!ingresoBD) return error(res, 400, 'El ingreso no existe');
        
        // Se verifica si el ingreso no esta repetido (CUIT y numero de remito)
        if(numero_remito != ingresoBD.numero_remito || proveedor != ingresoBD.proveedor){
            const ingresoRepetido = await Ingreso.findOne({ numero_remito, proveedor });
            if(ingresoRepetido) return error(res, 400, 'El número de remito esta repetido');
        }

        const ingreso = await Ingreso.findByIdAndUpdate(id, req.body);
        success(res, {ingreso});

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

module.exports = {
    getIngreso,
    listarIngresos,
    nuevoIngreso,
    actualizarIngreso,
}