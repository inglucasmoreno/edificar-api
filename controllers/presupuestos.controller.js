const chalk = require('chalk');
const path = require('path');
const Presupuesto = require('../models/presupuesto.model');
const {error, success} = require('../helpers/response');
const moment = require('moment');
const pdf = require('pdf-creator-node');
var fs = require('fs');

// Muestra de presupuesto por pantalla
const mostrarPresupuesto = (req, res) => {
  res.sendFile(path.join(__dirname, '../docs/presupuestos/presupuesto.pdf'));
}

// Generacion de presupuesto
const generarPresupuesto = async (req, res) => {
    
  var { productos, cliente } = req.body;
  var total = 0;
  var var_nro_presupuesto = 0;
  const fecha = moment().format('DD/MM/YYYY');

  // Se obtiene el numero de presupuesto
  const presupuesto = await Presupuesto.find();
  
  // Se genera el nuevo numero de presupuesto
  if(presupuesto.length === 0){
    const nuevoPresupuesto = Presupuesto({nro_presupuesto: 0});
    await nuevoPresupuesto.save();
    nro_presupuesto = 0; 
  }else{
    // Se incrementa en +1 el numero de presupuesto
    const {_id, nro_presupuesto} = presupuesto[0];
    const nro = nro_presupuesto + 1;
    await Presupuesto.findByIdAndUpdate(_id, { nro_presupuesto: nro });
    var_nro_presupuesto = nro;
  }

  // Se calcula el total y se adapta el formato de los precios
  productos.forEach(producto => {
    total += producto.total;
    producto.precio = Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(producto.precio);
    producto.total = Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(producto.total);
  });

  total = Intl.NumberFormat('es-AR', { minimumFractionDigits: 2 }).format(total);

  // Se trae el template
  var html = fs.readFileSync('reports/presupuestos/pdfTemplate/template.html', 'utf-8');
  
  // Opciones de documento
  var options = {
      format: "A4",
      orientation: "portrait",
      border: "10mm",
      footer: {
          height: "28mm",
          contents: {
              first: '<p style="color: #444; font-size:10px; background: #f2f2f2; padding: 10px; text-align:center;"> Estos precios pueden variar sin previo aviso </p>',
              2: 'Second page', // Any page number is working. 1-based index
              default: '<p style="color: #444; font-size:10px; background: #f2f2f2; padding: 10px; text-align:center;"> Estos precios pueden variar sin previo aviso </p>', // fallback value
              last: 'Last Page'
          }
      }
  };

  // Configuracion de documento
  var document = {
    html: html,
    data: {
      productos,
      total,
      fecha,
      cliente,
      nro_presupuesto: var_nro_presupuesto
    },
    path: `./docs/presupuestos/presupuesto.pdf`,
    type: "",
  };

  // Generacion del PDF
  pdf.create(document, options)
        .then((respuesta) => {
          success(res, { url: respuesta.filename })
        })
        .catch((err) => {
            console.log(chalk.red(err));
            error(res, 500);
        });

}

module.exports = {
  mostrarPresupuesto,
  generarPresupuesto
}
