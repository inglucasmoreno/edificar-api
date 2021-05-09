const { Schema, model } = require('mongoose');

const remitoEntregaSchema = Schema({
    dato_1: {
        type: String,
        trim: true,
        uppercase: true,
        required: 'El dato_1 es obligatorio'    
    },
    dato_2: {
        type: String,
        trim: true,
        uppercase: true,
        required: 'El dato_2 es obligatorio'    
    },
    egreso: { // Nota de venta
        type: Schema.Types.ObjectId,
        ref: 'egreso',
        required: 'La nota de venta es un valor obligatorio' 
    }
},{
    timestamps: true,
    collection: 'remito_entrega'
});

module.exports = model('remito_entrega', remitoEntregaSchema);