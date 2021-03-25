const { Schema, model } = require('mongoose');

// Productos - Entrada
const productoSchema = Schema({

    codigo: {
        type: String,
        trim: true,
        uppercase: true,
        required: 'Codigo es un campo obligatorio'
    },

    descripcion: {
        type: String,
        trim: true,
        uppercase: true,
        required: 'Descripcion es un campo obligatorio'
    },

    unidad_medida: {
        type: String,
        trim: true,
        uppercase: true,
        required: 'La unidad de medida es un campo obligatorio'     
    },

    cantidad: {
        type: Number,
        min: 0,
        required: 'La cantidad es un campo obligatorio'
    }

});

// Remito de ingreso
const ingresoSchema = Schema({

    numero_remito: {
        type: String,
        trim: true,
        uppercase: true,
        required: 'El numero de remito es un valor obligatorio'
    },

    // Datos de proveedor

    proveedor: {    // Relacion con el proveedor
        type: Schema.Types.ObjectId,
        required: 'El proveedor es obligatorio'
    },

    cuit_proveedor: {
        type: String,
        trim: true,
        uppercase: true,
        required: 'El CUIT es un campo obligatorio'
    },

    razon_social_proveedor: {
        type: String,
        trim: true,
        uppercase: true,
        required: 'La razon social es obligatoria'        
    },

    fecha_ingreso: {
        type: Date,
        default: Date.now()
    },

    estado: {
        type: String,
        default: 'En proceso'
    },

    activo: {
        type: Boolean,
        default: true
    },

    // Datos de productos
    productos: [productoSchema]

},{
    timestamps: true
});

module.exports = model('ingreso', ingresoSchema);