const { Schema, model } = require('mongoose');

const remitoEntregaProductos = Schema({
    remito_entrega:{
        type: Schema.Types.ObjectId,
        ref: 'remito_entrega',
        required: 'El remito de entrega es un valor obligatorio'     
    },
    producto: {
        type: Schema.Types.ObjectId,
        ref: 'producto',
        required: 'El producto es un valor obligatorio'         
    },
    cantidad: {
        type: Number,
        trim: true,
        required: 'La cantidad es un valor obligatorio'
    },
}, {
    timestamps: true,
    collection: 'remito_entrega_productos'
});

module.exports = model('remito_entrega_productos', remitoEntregaProductos)