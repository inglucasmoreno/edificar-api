const path = require('path');
const Usuario = require('../models/usuario.model');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { success, error } = require('../helpers/response');
const ExcelJs = require('exceljs');
const getReporte = async (req, res) => {

    try{
        const usuarios = await Usuario.find();
        
        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet('Mis usuarios');
        worksheet.columns = [
            { header: 'Apellido', key: 'apellido', width: 10 },
            { header: 'Nombre', key: 'nombre', width: 10 },
            { header: 'Email', key: 'email', width: 30 }
        ];
        usuarios.forEach( usuario => {
            worksheet.addRow({
                'apellido': usuario.apellido,
                'nombre': usuario.nombre,
                'email': usuario.email    
            });     
        });
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        })

        const nombreReporte = `../reports/usuarios/${ uuidv4() }.xlsx`;

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

module.exports = {
    getReporte
}