const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    currency: { type: String, default: 'INR' }
}, { timestamps: true });

module.exports = mongoose.model('Group', GroupSchema);
