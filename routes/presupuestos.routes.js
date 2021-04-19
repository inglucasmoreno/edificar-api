const { Router } = require('express');
const { validarJWT } = require('../middleware/validar-jwt');
const { generarPresupuesto, mostrarPresupuesto } = require('../controllers/presupuestos.controller');

const router = Router();

router.get('/', mostrarPresupuesto);
router.post('/', validarJWT, generarPresupuesto);

module.exports = router;