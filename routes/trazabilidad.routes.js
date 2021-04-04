const { Router } = require('express');
const { validarJWT } = require('../middleware/validar-jwt'); 
const { 
    listarTrazabilidad
} = require('../controllers/trazabilidad.controllers');

const router = Router();

router.get('/', listarTrazabilidad);

module.exports = router;