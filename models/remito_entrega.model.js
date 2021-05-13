const { Schema, model } = require('mongoose');

const remitoEntregaSchema = Schema({
    numero_remito: {
        type: String,
        trim: true,
        uppercase: true,
        required: 'El numero de remito es obligatorio'    
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