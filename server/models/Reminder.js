const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    forUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional: remind specific person
    dueDate: { type: Date, required: true },
    message: { type: String, default: 'Please settle your balance.' },
    sent: { type: Boolean, default: false },
    sentAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Reminder', ReminderSchema);
