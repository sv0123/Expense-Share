const mongoose = require('mongoose');

const SettlementSchema = new mongoose.Schema({
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // who paid
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },   // who received
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Settlement', SettlementSchema);
