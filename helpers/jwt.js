const chalk = require('chalk');
const jwt = require('jsonwebtoken');

const generarJWT = (uid) => {
    return new Promise((resolve, reject) => {
        const payload = { uid };
        jwt.sign(payload, process.env.JWT_SECRET || 'EquinoccioKey', {
            expiresIn: '4h'
        }, (err, token) => {
            if(err){
                console.log(chalk.red(err));
                reject('No se pudo generar el token');
            }else{
                resolve(token);
            }    
        });
    });
}

module.exports = {
    generarJWT
}