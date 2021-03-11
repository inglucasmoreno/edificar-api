const { Schema, model } = require('mongoose');

const unidadMedidaSchema = Schema({
    
    descripcion: {
        type: String,
        trim: true,
        uppercase: true,
        required: 'Descripcion es un campo obligatorio'
    },
    
    activo: {
        type: Boolean,
        required: 'Activo es un campo obligatorio',
        default: true
    }

}, { timestamps: true, collection: 'unidad_medida' } );

module.exports = model('unidad_medida', unidadMedidaSchema);