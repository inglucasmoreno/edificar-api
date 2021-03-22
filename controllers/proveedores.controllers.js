const chalk = require('chalk');
const {error, success} = require('../helpers/response');
const Proveedor = require('../models/proveedor.model');

// Proveedor por ID
const getProveedor = async (req, res) => {
    try{
        const id = req.params.id;
        const proveedor = await Proveedor.findById(id);
        if(!proveedor) return error(res, 400, 'El proveedor no existe');
        success(res, { proveedor }); 
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);    
    }
}

// Listar proveedores
const listarProveedores = async (req, res) => {
    try{
        // Ordenar
        let ordenar = [ req.query.columna || 'razon_social', req.query.direccion || 1 ];

        // Paginación
        const desde = Number(req.query.desde) || 0;
        const limit = Number(req.query.limit) || 0;

        // Filtrado
        const busqueda = {};
        let filtroOR = [];
        const fDescripcion = req.query.descripcion || '';
        const fActivo = req.query.activo || '';
        
        // Filtro activo
        if(fActivo) busqueda.activo = fActivo;
        
        // Filtro OR
        if(fDescripcion){
            const descripcion = new RegExp(fDescripcion, 'i'); // Expresion regular para busqueda insensible
            filtroOR.push({razon_social: descripcion});
            filtroOR.push({cuit: descripcion});
        }else{
            filtroOR.push({});
        }

        const [ proveedores, total ] = await Promise.all([
            Proveedor.find(busqueda)
                        .or(filtroOR)
                        .sort([ordenar])
                        .skip(desde)
                        .limit(limit),
            Proveedor.find(busqueda)
                        .or(filtroOR)
                        .countDocuments()
        ]);

        success(res, { proveedores, total });

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Nuevo proveedor
const nuevoProveedor = async (req, res) => {
    try{

        const { cuit } = req.body;

        // Se verifica si el CUIT ya esta registrado
        const cuitExiste = await Proveedor.findOne({ cuit });
        if(cuitExiste) return error(res, 400, 'El CUIT ya esta registrado');

        // Se crea el nuevo proveedor
        const proveedor = new Proveedor(req.body);
        const resultado = await proveedor.save();
        success(res, {proveedor: resultado});

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Actualizar proveedor
const actualizarProveedor = async (req, res) => {
    try{

        
        const id = req.params.id;
        const { cuit } = req.body;
        
        // Se verifica si el proveedor a actualizar existe
        const dbProveedor = await Proveedor.findById(id);
        if(!dbProveedor) return error(res, 400, 'El proveedor no existe');

        // Se verifica que el nuevo CUIT no este registrado - En caso de ser necesario
        if(cuit){
            if(cuit !== dbProveedor.cuit){
                const cuitExiste = await Proveedor.findOne({ cuit });
                if(cuitExiste) return error(res, 400, 'El CUIT ya esta registrado');        
            }    
        }

        const proveedor = await Proveedor.findByIdAndUpdate(id, req.body, {new: true});
        success(res, { proveedor });
    }catch(err){    
        console.log(chalk.red(err));
        error(res, 500);
    }
}

module.exports = {
    listarProveedores,
    getProveedor,
    nuevoProveedor,
    actualizarProveedor
}