const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    purpose: { type: String, required: true, trim: true },
    startTime: { type: String, required: true },
    finishTime: { type: String, required: true },
    maxVolunteers: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Maximum volunteers muct be a whole number'
      }
    },
    registeredCount: { type: Number, default: 0, min: 0 },

    organiser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true
    }
  },
  { timestamps: true }
)

//return a spot and increment while places available
eventSchema.statics.oneSpotClaim = async function (eventId) {
  return this.findOneAndUpdate(
    {
      _id: eventId,
      $expr: { $lt: [{$ifNull: ['$registeredCount', 0]}, '$maxVolunteers'] }
    },
    { $inc: { registeredCount: 1 } },
    { new: true }
  )
}

//return a single available spot when registration fails
eventSchema.statics.releaseASpot = async function (eventId) {
    return this.findOneAndUpdate(
        {_id: eventId, registeredCount: {$gt : 0}},
        {$inc : {registeredCount: -1}},
        {new: true}
    )
}

eventSchema.statics.registeredCount
module.exports = mongoose.model('Event', eventSchema)
