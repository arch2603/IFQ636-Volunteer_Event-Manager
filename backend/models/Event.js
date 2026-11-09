
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true, required: true },
    location: { type: String, required: true, trim: true },
    purpose: { type: String, required: true, trim: true },
    startTime: { type: String, required: true },
    finishTime: { type: String, required: true },
    maxVolunteers: { type: Number, required: true, min: 1, validate: {
        validator: Number.isInteger,
        message: 'Maximum volunteers muct be a whole number'
    }},
    organiser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true , immutable: true},

}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);