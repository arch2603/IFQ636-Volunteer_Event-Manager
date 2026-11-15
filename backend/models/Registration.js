
const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true , immutable: true},
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true , immutable: true},
}, { timestamps: true });

//VEM-14: Duplicate registrations - volunteer can only register to an even only once
registrationSchema.index({ event: 1, volunteer: 1}, {unique: true})

module.exports = mongoose.model('Registration', registrationSchema);