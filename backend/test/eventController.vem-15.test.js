const { expect } = require('chai')
const mongoose = require('mongoose')
const Event = require('../models/Event')
const Registration = require('../models/Registration')

const { registerForEvent } = require('../controllers/eventController')

const createRespond = () => {
  const res = {}
  res.status = code => {
    res.statusCode = code
    return res
  }
  res.json = body => {
    res.body = body
    return res
  }
  return res
}

describe('registerForEvent', () => {
  const initialState = {
    findOne: Registration.findOne,
    create: Registration.create,
    oneSpotClaim: Event.oneSpotClaim,
    exists: Event.exists,
    releaseASpot: Event.releaseASpot
  }
  afterEach(() => {
    Registration.findOne = initialState.findOne
    Registration.create = initialState.create
    Event.oneSpotClaim = initialState.oneSpotClaim
    Event.exists = initialState.exists
    Event.releaseASpot = initialState.releaseAspot
  })

  const makeReq = (id = new mongoose.Types.ObjectId().toString()) => ({
    params: { id },
    user: { _id: new mongoose.Types.ObjectId().toString() }
  })

  it('U1 returns 404 for malformed ID', async () => {
    const req = makeReq('not-id')
    const res = createRespond()
    let dbCall = false
    Registration.findOne = () => {
      dbCall = true
    }

    await registerForEvent(req, res)

    expect(res.statusCode).to.equal(404)
    expect(res.body).to.deep.equal({ message: 'Event not found' })
    expect(dbCall).to.equal(false)
  })

  it('U2 returns 409 already registered', async () => {
    const req = makeReq()
    Registration.findOne = async () => ({
      event: req.params.id,
      volunteer: req.user._id
    })
    const res = createRespond()

    await registerForEvent(req, res)

    expect(res.statusCode).to.equal(409)
    expect(res.body).to.deep.equal({
      message: 'You have already registered for this event'
    })
  })

  it('U3 returns 404 event does not exist', async () => {
    const req = makeReq()
    Registration.findOne = async () => null
    Event.oneSpotClaim = async () => null
    Event.exists = async () => false

    const res = createRespond()

    await registerForEvent(req, res)

    expect(res.statusCode).to.equal(404)
    expect(res.body).to.deep.equal({ message: 'Event not found' })
  })

  it('U4 returns 409 event is full', async () => {
    const req = makeReq()
    Registration.findOne = async () => null
    Event.oneSpotClaim = async () => null
    Event.exists = async () => true

    const res = createRespond()

    await registerForEvent(req, res)

    expect(res.statusCode).to.equal(409)
    expect(res.body).to.deep.equal({ message: 'This event is full' })
  })

  it('U5 returns 201 registration successful', async () => {
    const req = makeReq()
    const mockEvent = {
      _id: req.params.id,
      title: 'VEM-14 success registration for an event',
      maxVolunteers: 8,
      registeredCount: 1,
      toObject: () => ({
        _id: req.params.id,
        title: 'VEM-14 success registration for an event',
        maxVolunteers: 8,
        registeredCount: 1
      })
    }
    Registration.create = async () => true

    Registration.findOne = async () => null
    Event.oneSpotClaim = async () => mockEvent

    const res = createRespond()
   
    await registerForEvent(req, res)
    console.log(res.body.event)
    expect(res.statusCode).to.equal(201)
    expect(res.body.message).to.equal('Registration successful')
    expect(res.body.event).to.have.property('title')
    expect(res.body.event).to.have.property('availablePlaces', 7)
    expect(res.body.event).to.have.property('registeredCount', 1)
  })
})
