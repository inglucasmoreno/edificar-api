const chalk = require('chalk');
const mongoose = require('mongoose');

const dbConnection = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/edificarSRL',{
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false              
        });
        console.log(chalk.blue('[MongoDB]') + ' - Conexion a base de datos -> ' + chalk.green('[Correcta]'));
    }catch(err){
        console.log(err);
        throw new Error('Error al conectar con la base de datos');    
    }     
} 

module.exports = dbConnection;