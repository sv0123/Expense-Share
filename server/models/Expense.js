const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For now assume equal split among these
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
