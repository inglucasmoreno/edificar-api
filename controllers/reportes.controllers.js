const path = require('path');
const ExcelJs = require('exceljs');
const chalk = require('chalk');
const { error } = require('../helpers/response');

const Usuario = require('../models/usuario.model');
const Producto = require('../models/producto.model');

// Reporte - Usuarios
const usuarios = async (req, res) => {
    try{
        const usuarios = await Usuario.find().sort('apellido');
        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet('Edificar - Usuarios');
        
        worksheet.columns = [
            { header: 'Apellido', key: 'apellido', width: 28 },
            { header: 'Nombre', key: 'nombre', width: 28 },
            { header: 'Usuario', key: 'usuario', width:30 },
            { header: 'Rol', key: 'rol', width: 17 },
            { header: 'Email', key: 'email', width: 35 },
            { header: 'estado', key: 'estado', width: 10 }
        ];
        
        usuarios.forEach( usuario => {
            worksheet.addRow({
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

// Reporte - Productos
const productos = async (req, res) => {
    try{
        const productos = await Producto.find()
                                        .populate('unidad_medida','descripcion')
                                        .sort('codigo');
        
        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet('Edificar - Productos');

        worksheet.columns = [
            { header: 'Codigo', key: 'codigo', width: 20 },
            { header: 'Descripcion', key: 'descripcion', width: 30 },
            { header: 'Precio', key: 'precio', width: 15 },
            { header: 'Unidad de medida', key: 'unidad_medida', width:25 },
            { header: 'Stock actual', key: 'stock_actual', width: 20 },
            { header: '¿Stock minimo?', key: 'stock_minimo', width: 20 },
            { header: '¿Cantidad minima?', key: 'cantidad_minima', width: 20 },
            { header: 'estado', key: 'estado', width: 15 }
        ];

        productos.forEach( producto => {
            worksheet.addRow({
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


module.exports = {
    usuarios,
    productos
}