const { Schema, model } = require('mongoose');

const proveedorSchema = Schema({
    
    razon_social: {
        type: String,
        trim: true,
        uppercase: true,
        required: 'La razon social es un campo obligatorio'
    },

    cuit: {
        type: String,
        unique: true,
        trim: true,
        uppercase: true,
        required: 'El CUIT es un campo obligatorio'
    },

    activo: {
        type: Boolean,
        default: true
    }

},{
    timestamps: true,
    collection: 'proveedores'
});

module.exports = model('proveedor', proveedorSchema);
