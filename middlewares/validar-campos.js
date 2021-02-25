const { validationResult } = require('express-validator');
const { error } = require('../helpers/response');

const validarCampos = (req, res, next) => {
    
    // Se evalua si en la request hay errores [Express-Validator]
    const errores = validationResult(req);
    if(!errores.isEmpty()){
        return error(res, 400, {
            errors: errores.mapped() // Podria ser tambien -> array()
        });
    }
    next(); // Se continua hacia el controlador correspondiente (Si no hay errores)
}

module.exports = {
    validarCampos
}