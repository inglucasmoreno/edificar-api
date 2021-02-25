const { Router } = require('express');
const {
    getReporte
} = require('../controllers/reportes.controllers');

const router = Router();

router.get('/usuarios' , getReporte);

module.exports = router;