const path = require('path');
const ExcelJs = require('exceljs');
const chalk = require('chalk');
const { error } = require('../helpers/response');
const moment = require('moment');
const mongoose = require('mongoose');

const Usuario = require('../models/usuario.model');
const Producto = require('../models/producto.model');
const Trazabilidad = require('../models/trazabilidad.model');
const Unidad = require('../models/unidad_medida.model');
const Ingreso = require('../models/ingreso.model');
const Egreso = require('../models/egreso.model');
const Proveedor = require('../models/proveedor.model');

// Guia de usuario
const guiaUsuario = async (req, res) => {
    try{
        const relativeGuia = `../docs/guia_usuario/Guia.pdf`;
        const pathGuia = path.join(__dirname, relativeGuia);
        res.sendFile(pathGuia);
    }catch(error){
        console.log(chalk.red(error));
        error(res, 500);        
    }
}


// Reporte - Usuarios
const usuarios = async (req, res) => {
    try{

        // Ordenar
        let ordenar = [req.query.columna || 'apellido', req.query.direccion || 1];
        
        // Se prepara el filtrado
        const filtroParametro = req.query.parametro || '';
        const filtroActivo = req.query.activo || '';
        
        // Filtro Normal
        const busqueda = {};
        if(filtroActivo) busqueda.activo = filtroActivo;

        let filtroNombre = {};
        let filtroApellido = {};
        let filtroDni = {};

        // Filtro por OR - Nombre, Apellido, DNI
        if(filtroParametro){
            const parametro = new RegExp(filtroParametro, 'i'); // Expresion regular para busqueda insensible
            filtroNombre = { nombre: parametro };
            filtroApellido = { apellido: parametro };
            filtroDni = { dni: parametro };
            filtroRol = { role: parametro };
        }

        const usuarios = await Usuario.find(busqueda)
                                      .or(filtroNombre)
                                      .or(filtroApellido)
                                      .or(filtroDni)
                                      .sort([ordenar])

        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet('Edificar - Usuarios');
        
        worksheet.columns = [
            { header: 'Fecha de creación', key: 'fecha', width: 18 },
            { header: 'Apellido', key: 'apellido', width: 28 },
            { header: 'Nombre', key: 'nombre', width: 28 },
            { header: 'Usuario', key: 'usuario', width:30 },
            { header: 'Rol', key: 'rol', width: 17 },
            { header: 'Email', key: 'email', width: 35 },
            { header: 'Estado', key: 'estado', width: 10 }
        ];
        
        usuarios.forEach( usuario => {
            worksheet.addRow({
                'fecha': moment(usuario.createdAt).format('DD/MM/YYYY'),
                'apellido': usuario.apellido,
                'nombre': usuario.nombre,
                'usuario': usuario.dni,
                'rol': usuario.role === 'ADMIN_ROLE' ? 'Administrador' : 'Consulta',
                'email': usuario.email,
                'estado': usuario.activo ? 'Activo' : 'Inactivo'
            });     
        });
        
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        })

        // const nombreReporte = `../reports/usuarios/${ uuidv4() }.xlsx`;
        const nombreReporte = `../reports/usuarios/usuarios.xlsx`;

        workbook.xlsx.writeFile(path.join(__dirname, nombreReporte)).then( async data => {
            const pathReporte = path.join(__dirname, nombreReporte);
            res.sendFile(pathReporte);            
        }); 


    }catch(error){
        console.log(chalk.red(error));
        error(res, 500);
    }


    // const pathReporte = path.join(__dirname, `../reports/Ejemplo.xlsx`);
    // if(fs.existsSync(pathReporte)){
    //     res.sendFile(pathReporte);
    // }else{
    //     error(res, 500);
    // }
         
}

// Reporte - Unidad de medida
const unidad_medida = async (req, res) => {   
    try{
        
         // Ordenar
         let ordenar = [ req.query.columna || 'descripcion', req.query.direccion || 1 ];
 
         // Filtrado
         const busqueda = {};
         const fDescripcion = req.query.descripcion || '';
         const fActivo = req.query.activo || '';
         if(fActivo) busqueda.activo = fActivo;
         if(fDescripcion){
             const descripcion = new RegExp(fDescripcion, 'i'); // Expresion regular para busqueda insensible
             busqueda.descripcion = descripcion;
         }
 
        const unidades = await Unidad.find(busqueda)
                                           .sort([ordenar])

        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet('Edificar - Unidades de medida');
        
        worksheet.columns = [
            { header: 'Fecha de creación', key: 'fecha', width: 18 },
            { header: 'Descripción', key: 'descripcion', width: 35 },
            { header: 'Estado', key: 'estado', width:18 },
        ];
        
        unidades.forEach( unidad => {
            worksheet.addRow({
                'fecha': moment(unidad.createdAt).format('DD/MM/YYYY'),
                'descripcion': unidad.descripcion,
                'estado': unidad.activo ? 'Activo' : 'Inactivo'
            });     
        });
        
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        })

        // const nombreReporte = `../reports/usuarios/${ uuidv4() }.xlsx`;
        const nombreReporte = `../reports/unidades/unidades.xlsx`;

        workbook.xlsx.writeFile(path.join(__dirname, nombreReporte)).then( async data => {
            const pathReporte = path.join(__dirname, nombreReporte);
            res.sendFile(pathReporte);            
        }); 

    }catch(error){
        console.log(chalk.red(error));
        error(res, 500);
    }
}

// Reporte - Proveedores
const proveedores = async (req, res) => {   
    try{
        
        // Ordenar
        let ordenar = [ req.query.columna || 'razon_social', req.query.direccion || 1 ];

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

        const proveedores = await Proveedor.find(busqueda)
                                           .or(filtroOR)
                                           .sort([ordenar])

        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet('Edificar - Proveedores');
        
        worksheet.columns = [
            { header: 'Fecha de creación', key: 'fecha', width: 18 },
            { header: 'Razon social', key: 'razon_social', width: 35 },
            { header: 'Cuit', key: 'cuit', width:18 },
            { header: 'Condicion frente al IVA', key: 'condicion_iva', width:35 },
            { header: 'Domicilio', key: 'domicilio', width:35 },
            { header: 'Estado', key: 'estado', width:18 },
        ];
        
        proveedores.forEach( proveedor => {
            worksheet.addRow({
                'fecha': moment(proveedor.createdAt).format('DD/MM/YYYY'),
                'razon_social': proveedor.razon_social,
                'cuit': proveedor.cuit,
                'condicion_iva': proveedor.condicion_iva,
                'domicilio': proveedor.domicilio,
                'estado': proveedor.activo ? 'Activo' : 'Inactivo'
            });     
        });
        
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        })

        // const nombreReporte = `../reports/usuarios/${ uuidv4() }.xlsx`;
        const nombreReporte = `../reports/proveedores/proveedores.xlsx`;

        workbook.xlsx.writeFile(path.join(__dirname, nombreReporte)).then( async data => {
            const pathReporte = path.join(__dirname, nombreReporte);
            res.sendFile(pathReporte);            
        }); 

    }catch(error){
        console.log(chalk.red(error));
        error(res, 500);
    }
}

// Reporte - Productos
const productos = async (req, res) => {
    try{

        // Pipeline para agregacion
        let pipeline = [];

        // Etapa 1 - Filtrado por codigo
        if(req.query.codigo){
            const regex = new RegExp(req.query.codigo, 'i'); // Expresion regular para busqueda insensible
            pipeline.push({$match: {codigo: regex}});
        }
            
        if(req.query.descripcion){
            const regex = new RegExp(req.query.descripcion, 'i'); // Expresion regular para busqueda insensible
            pipeline.push({$match: { $or: [{ descripcion: regex }, { codigo: regex }] }});        
        }

        // Etapa 3 - Filtrado por activo/inactivo
        if(req.query.activo == 'true'){
            pipeline.push({$match: { activo: true }});
        }else if(req.query.activo == 'false'){
            pipeline.push({$match: { activo: false }}); 
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
        
        // Etapa 5 - Ordenando datos
        const ordenar = {};
        if(req.query.columna){
            ordenar[req.query.columna] = Number(req.query.direccion); 
            pipeline.push({$sort: ordenar});
        }
        
        // Se obtienen los datos
        const productos = await Producto.aggregate(pipeline);
                
        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet('Edificar - Productos');

        worksheet.columns = [
            { header: 'Fecha de creación', key: 'fecha', width: 20 },
            { header: 'Codigo', key: 'codigo', width: 20 },
            { header: 'Descripcion', key: 'descripcion', width: 30 },
            { header: 'Precio', key: 'precio', width: 15 },
            { header: 'Unidad de medida', key: 'unidad_medida', width:25 },
            { header: 'Stock actual', key: 'stock_actual', width: 20 },
            { header: '¿Stock minimo?', key: 'stock_minimo', width: 20 },
            { header: '¿Cantidad minima?', key: 'cantidad_minima', width: 20 },
            { header: 'Estado', key: 'estado', width: 15 }
        ];

        productos.forEach( producto => {
            worksheet.addRow({
                'fecha': moment(producto.createdAt).format('DD/MM/YYYY'),
                'codigo': producto.codigo,
                'descripcion': producto.descripcion,
                'precio': producto.precio,
                'unidad_medida': producto.unidad_medida.descripcion,
                'stock_actual': producto.cantidad,
                'stock_minimo': producto.stock_minimo ? 'Si' : 'No',
                'cantidad_minima': producto.cantidad_minima,
                'estado': producto.activo ? 'Activo' : 'Inactivo'
            });     
        });      

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        })

        // const nombreReporte = `../reports/usuarios/${ uuidv4() }.xlsx`;
        const nombreReporte = `../reports/productos/productos.xlsx`;

        workbook.xlsx.writeFile(path.join(__dirname, nombreReporte)).then( async data => {
            const pathReporte = path.join(__dirname, nombreReporte);
            res.sendFile(pathReporte);            
        }); 

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

// Reportes - Ingresos
const ingresos = async (req, res) => {

    try{

        // Filtrado
        let pipeline = [];

        // Etapa 1 - Filtrado por estado
        if(req.query.estado){
            pipeline.push({$match: {estado: req.query.estado}});
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
        
        pipeline.push({ $unwind: '$proveedor' });

        // Etapa 4 - Filtrado por descripcion
        // - Numero de remito | Razon social de proveedor | CUIT de proveedor
        if(req.query.descripcion){
            const descripcion = new RegExp(req.query.descripcion, 'i'); // Expresion regular para busqueda insensible
            pipeline.push({$match: { $or: [{ numero_remito: descripcion }, { 'proveedor.razon_social' : descripcion }, {'proveedor.cuit': descripcion}] }});
        }

        // Etapa 5 - Ordenando datos
        const ordenar = {};
        if(req.query.columna){
            ordenar[req.query.columna] = Number(req.query.direccion); 
            pipeline.push({$sort: ordenar});
        } 

        const ingresos = await Ingreso.aggregate(pipeline);
        console.log(ingresos);

        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet('Edificar - Ingresos');

        worksheet.columns = [
            { header: 'Nro de remito', key: 'nro_remito', width: 20 },
            { header: 'Proveedor', key: 'proveedor', width: 35 },
            { header: 'Proveedor (CUIT)', key: 'proveedor_cuit', width: 35 },
            { header: 'Fecha creación', key: 'fecha_creacion', width: 20 },
            { header: 'Fecha cierre', key: 'fecha_cierre', width: 20 },
            { header: 'Estado', key: 'estado', width: 18 }
        ];

        ingresos.forEach( ingreso => {
        worksheet.addRow({
            'nro_remito': ingreso.numero_remito, 
            'proveedor': ingreso.proveedor.razon_social,
            'proveedor_cuit': ingreso.proveedor.cuit,
            'fecha_creacion': moment(ingreso.createdAt).format('DD/MM/YYYY'),
            'fecha_cierre': ingreso.estado === 'Completado' ? moment(ingreso.fecha_ingreso).format('DD/MM/YYYY') : 'Todavia activo',
            'estado': ingreso.estado
        });     
        });      

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        })

        // const nombreReporte = `../reports/usuarios/${ uuidv4() }.xlsx`;
        const nombreReporte = `../reports/ingresos/ingresos.xlsx`;

        workbook.xlsx.writeFile(path.join(__dirname, nombreReporte)).then( async data => {
            const pathReporte = path.join(__dirname, nombreReporte);
            res.sendFile(pathReporte);            
        });         

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);        
    }

}

// Reportes - Egresos
const egresos = async (req, res) => {

    try{
        // Ordenar
        let ordenar = [ req.query.columna || 'createdAt', req.query.direccion || 1 ];

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

        const egresos = await Egreso.find(busqueda)
                                    .or(filtroOR)
                                    .sort([ordenar])

        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet('Edificar - Egresos');

        worksheet.columns = [
            { header: 'Codigo', key: 'codigo', width: 18 },
            { header: 'Cliente - Descripción', key: 'cliente_descripcion', width: 35 },
            { header: 'Cliente - Tipo de identificación', key: 'cliente_tipo_identificacion', width: 35 },
            { header: 'Cliente - Identificación', key: 'cliente_identificacion', width: 35 },
            { header: 'Fecha creación', key: 'fecha_creacion', width: 20 },
            { header: 'Fecha cierre', key: 'fecha_cierre', width: 20 },
            { header: 'Estado', key: 'estado', width: 18 }
        ];

        egresos.forEach( egreso => {
        worksheet.addRow({
            'codigo': egreso.codigo_cadena, 
            'cliente_descripcion': egreso.descripcion_cliente,
            'cliente_tipo_identificacion': egreso.tipo_identificacion_cliente,
            'cliente_identificacion': egreso.identificacion_cliente,
            'fecha_creacion': moment(egreso.createdAt).format('DD/MM/YYYY'),
            'fecha_cierre': egreso.estado === 'Completado' ? moment(egreso.fecha_egreso).format('DD/MM/YYYY') : 'Todavia activo',
            'estado': egreso.estado
        });     
        });      

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        })

        // const nombreReporte = `../reports/usuarios/${ uuidv4() }.xlsx`;
        const nombreReporte = `../reports/egresos/egresos.xlsx`;

        workbook.xlsx.writeFile(path.join(__dirname, nombreReporte)).then( async data => {
            const pathReporte = path.join(__dirname, nombreReporte);
            res.sendFile(pathReporte);            
        });         

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }

}

// Reportes - Trazabilidad
const trazabilidad = async (req, res) => {
    try{

        const { producto, tipo, parametro, fechaAntes, fechaDespues } = req.query;

        const pipeline = [];
        pipeline.push({$match: { }});

        // Etapa 1 - Filtrado por tipo
        if(tipo) {
            pipeline.push({$match: { tipo }});
        } 
        
        // Etapa 2 - Filtrado por producto
        if(producto) {
            pipeline.push({$match: { producto: mongoose.Types.ObjectId(producto) }});
        } 
    
        // Etapa 3 - Filtrado por rango de fechas [Despues - Antes]    
        if(fechaDespues){
            pipeline.push({$match: { createdAt: { $gte: new Date(fechaDespues) } }});
        }
        
        if(fechaAntes){
            const fechaAntesMod = moment(fechaAntes).add(1, 'days');
            pipeline.push({$match: { createdAt: { $lte: new Date(fechaAntesMod) } }});
        }

        // Etapa 4 - Filtrado por parametro
        if(parametro) {
            const descripcion = new RegExp(req.query.parametro, 'i'); // Expresion regular para busqueda insensible
            pipeline.push({$match: {persona_empresa: descripcion}});
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

        // Etapa 6 - Join (Producto -> Unidad de medida)   
        pipeline.push(
            { $lookup: { // Lookup - Tipos
                from: 'unidad_medida',
                localField: 'producto.unidad_medida',
                foreignField: '_id',
                as: 'producto.unidad_medida'
            }},
        );
        pipeline.push({ $unwind: '$producto.unidad_medida' });
        
        const ordenar = {};    
        
        // Etapa 7 - Ordenando datos
        if(req.query.columna){
            ordenar[req.query.columna] = Number(req.query.direccion); 
            pipeline.push({$sort: ordenar});
        }

        // Se genera la salida  
        const trazabilidad = await Trazabilidad.aggregate(pipeline);
        
        // Generacion del reporte en excel
        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet('Edificar - Trazabilidad');

        worksheet.columns = [
            { header: 'Fecha', key: 'fecha', width: 18 },
            { header: 'Tipo', key: 'tipo', width: 18 },
            { header: 'Codigo', key: 'codigo', width: 18 },
            { header: 'Proveedor/Cliente', key: 'proveedor_cliente', width:30 },
            { header: 'Producto', key: 'producto', width:30 },
            { header: 'Unidad', key: 'unidad_medida', width: 22 },
            { header: 'Stock anterior', key: 'stock_anterior', width: 17 },
            { header: 'Stock actual', key: 'stock_actual', width: 17 },
        ];

        trazabilidad.forEach( elemento => {
            worksheet.addRow({
                'fecha': moment(elemento.createdAt).format('DD/MM/YYYY'),
                'tipo': elemento.tipo,
                'codigo': elemento.documento_codigo,
                'proveedor_cliente': elemento.persona_empresa,
                'producto': elemento.producto.descripcion,
                'unidad_medida': elemento.producto.unidad_medida.descripcion,
                'stock_anterior': elemento.stock_anterior,
                'stock_actual': elemento.stock_nuevo,
            });     
        });      

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        })

        // const nombreReporte = `../reports/usuarios/${ uuidv4() }.xlsx`;
        const nombreReporte = `../reports/trazabilidad/trazabilidad.xlsx`;

        workbook.xlsx.writeFile(path.join(__dirname, nombreReporte)).then( async data => {
            const pathReporte = path.join(__dirname, nombreReporte);
            res.sendFile(pathReporte);            
        }); 


    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}


module.exports = {
    guiaUsuario,
    usuarios,
    unidad_medida,
    proveedores,
    productos,
    ingresos,
    egresos,
    trazabilidad,
}