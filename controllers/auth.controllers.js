const chalk = require('chalk');
const bcryptjs = require('bcryptjs');

const Usuario = require('../models/usuario.model');
const {error, success} = require('../helpers/response');
const { generarJWT } = require('../helpers/jwt');

// Login de usuario
const login = async (req, res) => {
    
    try{
        const {dni, password} = req.body;

        // Se verifica si el usuario existe
        const usuarioDB = await Usuario.findOne({dni});
        if(!usuarioDB) return error(res, 400, 'Los datos son incorrectos');
        
        // Se verifica password
        const validPassword = bcryptjs.compareSync(password, usuarioDB.password);
        if(!validPassword) return error(res, 400, 'Los datos son incorrectos'); 
        
        // Se verifica si el usuario esta activo
        if(!usuarioDB.activo) return error(res, 400, 'Los datos son incorrectos');

        // Se genera el token
        const token = await generarJWT(usuarioDB._id);

        success(res, { token });

    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
    
}

// Se renueva el token
const renewtoken = async (req, res) => {
    try{
        const uid = req.uid; // El uid se obtiene del middleware "validar-jwt"
        const [token, usuario] = await Promise.all([
            generarJWT(uid),
            Usuario.findById(uid, 'dni apellido nombre email role activo')
        ]);
        success(res, {
            token,
            usuario
        });
    }catch(err){
        console.log(chalk.red(err));
        error(res, 500);
    }
}

module.exports = {
    login,
    renewtoken
}