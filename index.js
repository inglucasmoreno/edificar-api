require('dotenv').config();
const chalk = require('chalk');
const path = require('path');

// [Express]
const express = require('express');
const app = express();
const api_port = process.env.PORT || 3001;

// [Base de datos] - MongoDB
const dbConnection = require('./database/config');
dbConnection();

// [Configuraciones]
app.use(require('cors')());
app.use(express.json());
app.use(express.static('public'));

// [Rutas]
app.get('/', (req, res) => res.json({welcome: 'Bienvenidos a Equinoccio Technology'}));
// app.use('/api/usuarios', require('./routes/usuarios.routes'));
// app.use('/api/auth', require('./routes/auth.routes'));

// Lo ultimo
// Nota: Esto es necesario para que en produccion al recargar no se pierda la ruta
// - Siempre que tenga que buscar una ruta nueva -> tiene que pasar por el index.html
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public/index.html'));
})

// [Ejecucion de servidor]
app.listen(api_port, () => {
    console.log(chalk.blue('[Desarrollador]') + ' - Equinoccio Technology');    
    console.log(chalk.blue('[Express]') + ` - Servidor corriendo en http://localhost:${api_port}`);
});