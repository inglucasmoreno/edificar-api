const chalk = require('chalk');
const {error, success} = require('../helpers/response');
const { aggregate } = require('../models/producto.model');
const Producto = require('../models/producto.model');

// Nuevo usuario
const nuevoProducto = async (req, res) => {
    try{
        
        const { codigo } = req.body;
        
        // Se verifica si el codigo no esta repetido
        const codigoRepetido = await Producto.findOne({ codigo: codigo.toUpperCase() });
        if(codigoRepetido) return error(res, 400, 'El codigo ya esta registrado');

        const producto = new Producto(req.body);
        await producto.save();
        success(res, { producto });
   
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Producto por ID
const getProducto = async (req, res) => {   
    try{
        const producto = await Producto.findById(req.params.id)
                                       .populate('unidad_medida', 'descripcion')
        if(!producto) return error(400, 'El producto no existe');
        success(res, { producto });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Listar productos
const listarProductos = async (req, res) => {
    try{    

        // Busqueda para calculo del total
        const busqueda = {};

        // Pipeline para agregacion
        let pipeline = [];

        // Etapa 1 - Filtrado por codigo
        if(req.query.codigo){
            const regex = new RegExp(req.query.codigo, 'i'); // Expresion regular para busqueda insensible
            pipeline.push({$match: {codigo: regex}});
            busqueda['codigo'] = regex;            
        }
        
        // Etapa 2 - Filtrado por descripcion o codigo
        let filtroCodigo = {};
        let filtroDescripcion = {};
        
        if(req.query.descripcion){
            const regex = new RegExp(req.query.descripcion, 'i'); // Expresion regular para busqueda insensible
            pipeline.push({$match: { $or: [{ descripcion: regex }, { codigo: regex }] }});
            // pipeline.push({$match: { $or: [{ descripcion: regex }] }});
            // busqueda['descripcion'] = regex;  
            filtroCodigo = { codigo: regex };
            filtroDescripcion = { descripcion: regex };          
        }

        // Etapa 3 - Filtrado por activo/inactivo
        if(req.query.activo == 'true'){
            pipeline.push({$match: { activo: true }});
            busqueda['activo'] = true;
        }else if(req.query.activo == 'false'){
            pipeline.push({$match: { activo: false }}); 
            busqueda['activo'] = false;
        }

        // Etapa 4 - Join (Unidad de medida)     
        pipeline.push(
            { $lookup: { // Lookup - Tipos
                from: 'unidad_medida',
                localField: 'unidad_medida',
                foreignField: '_id',
                as: 'unidad_medida'
            }},
        );
        pipeline.push({ $unwind: '$unidad_medida' });
        
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
            Producto.aggregate(pipeline),
            Producto.find(busqueda)
                    .or(filtroCodigo)
                    .or(filtroDescripcion)
                    .countDocuments()    
        ]);

        success(res, { productos, total });    

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Actualizar producto
const actualizarProducto = async (req, res) => {
    try{
        const { id } = req.params;
        let producto = Producto.findById(id);

        // Se verifica si el producto a actualizar exite
        if(!producto) return error(res, 400, 'El producto no existe');
        
        // Se verifica si el nuevo codigo ya esta registrado
        if(req.body.codigo){
            const codigoExiste = await Producto.findOne({ codigo: req.body.codigo.toUpperCase() });
            console.log(codigoExiste);
            if(codigoExiste) return error(res, 400, 'El codigo ya esta registrado');
        }
        
        producto = await Producto.findByIdAndUpdate(id, req.body, { new: true });
        success(res, { producto }) 
    }catch(err){
        console.log(chalk.red(err));
    }
}

module.exports = {
    nuevoProducto,
    getProducto,
    listarProductos,
    actualizarProducto
}
