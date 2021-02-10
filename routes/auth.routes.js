const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const {
    login,
    renewtoken
} = require('../controllers/auth.controllers');

const router = Router();

router.get('/', validarJWT ,renewtoken);
router.post('/',
    [   
        check('dni', 'El DNI es obligatorio').not().isEmpty(),
        check('password', 'El password es obligatorio').not().isEmpty(),
        validarCampos,        
    ] ,login);

module.exports = router;