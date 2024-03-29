const chalk = require('chalk');
const path = require('path');
const Presupuesto = require('../models/presupuesto.model');
const { error, success } = require('../helpers/response');
const moment = require('moment');
const pdf = require('pdf-creator-node');
var fs = require('fs');

// Muestra de presupuesto por pantalla
const mostrarPresupuesto = (req, res) => {
    res.sendFile(path.join(__dirname, '../docs/presupuestos/presupuesto.pdf'));
}

// Generacion de presupuesto
const generarPresupuesto = async(req, res) => {

    var { productos, cliente } = req.body;
    var total = 0;
    var var_nro_presupuesto = 0;
    const fecha = moment().format('DD/MM/YYYY');

    // Se obtiene el numero de presupuesto
    const presupuesto = await Presupuesto.find();

    // Se genera el nuevo numero de presupuesto
    if (presupuesto.length === 0) {
        const nuevoPresupuesto = Presupuesto({ nro_presupuesto: 0 });
        await nuevoPresupuesto.save();
        nro_presupuesto = 0;
    } else {
        // Se incrementa en +1 el numero de presupuesto
        const { _id, nro_presupuesto } = presupuesto[0];
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
                first: '<ul style="color: #444; list-style-type: circle; font-size:9px; border-style:solid; padding-top: 10px; padding-bottom: 10px; border-width:1px; border-color:gray;"><li> Estos precios pueden variar sin previo aviso. </li> <li> Material a retirar por el cliente. </li> <li> Plazo de entrega a convenir. </li> <li> Los precios incluyen IVA </li></ul>',
                2: 'Second page', // Any page number is working. 1-based index
                default: '<ul style="color: #444; list-style-type: circle; font-size:9px; border-style:solid; padding-top: 10px; padding-bottom: 10px; border-width:1px; border-color:gray;"><li> Estos precios pueden variar sin previo aviso. </li> <li> Material a retirar por el cliente. </li> <li> Plazo de entrega a convenir. </li> <li> Los precios incluyen IVA </li></ul>', // fallback value
                last: 'Last Page'
            }
        }
    };

    // Configuracion de documento
    var document = {
        html: html,
        data: {
            url_membrete: 'http://localhost:' + (process.env.PORT || 3000) + '/docs/img/membrete.png',
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