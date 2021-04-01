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
                        .limit(limit)
                        .populate('proveedor'),
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