/*
    Desarrollador: Equinoccio Technology
    CEO: ing. Lucas Omar Moreno
    Año: 2021
    Cliente: Edificar SRL
*/

// [Varios]
require('dotenv').config();
const chalk = require('chalk');
const path = require('path');

// [Express]
const express = require('express');
const app = express();
const api_port = process.env.PORT || 3000;

// [Base de datos] - MongoDB
const dbConnection = require('./database/config');
dbConnection();

// [Configuraciones]
app.use(require('cors')());
app.use(express.json());
app.use(express.static('public'));

// [Rutas]
app.use('/api/reportes', require('./routes/reportes.routes'));
app.use('/api/usuarios', require('./routes/usuarios.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/unidad_medida', require('./routes/unidad_medida.routes'));
app.use('/api/proveedores', require('./routes/proveedores.routes'));
app.use('/api/productos', require('./routes/productos.routes'));
app.use('/api/ingresos', require('./routes/ingreso.routes'));
app.use('/api/egresos', require('./routes/egreso.routes'));
app.use('/api/ingreso_productos', require('./routes/ingreso_productos.routes'));
app.use('/api/egreso_productos', require('./routes/egreso_productos.routes'));

// [Necesario para no perder la ruta en produccion]
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

// [Ejecucion de servidor]
app.listen(api_port, () => {
    console.log(chalk.blue('[Desarrollador]') + ' - Equinoccio Technology');    
    console.log(chalk.blue('[Express]') + ` - Servidor corriendo en http://localhost:${api_port}`);
});