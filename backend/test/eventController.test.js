const { expect } = require('chai');
const mongoose = require('mongoose');
const Event = require('../models/Event')
const { getEvents, getEventById } = require('../controllers/eventController')

const createRespond = () => {
    const res = {};
    res.status = code => { res.statusCode = code; return res }
    res.json = body => { res.body = body; return res; }
    return res
}

describe('getEvents', () => {
    const realFind = Event.find;
    afterEach(() => { Event.find = realFind; })

    it('returns 200 and all events, time, date with sorting', async () => {
        const req = {}
        const res = createRespond();
        let sortEvent;
        Event.find = () => ({
            sort: (e) => {
                sortEvent = e;
                return {
                    lean: async () => [
                        { title: "Community clean-up test 1", date: "14-11-2026", startTime: "09:00" },
                        { title: "Community clean-up test 2", date: "15-11-2026", startTime: "09:00" },
                    ]
                }
            }
        });

        await getEvents(req, res)
        expect(res.statusCode).to.equal(200);
        expect(sortEvent).to.deep.equal({ date: 1, startTime: 1 });
        expect(res.body.events).to.have.lengthOf(2);
        expect(res.body.events[0]).to.include({ title: "Community clean-up test 1" })
        expect(res.body.events[1]).to.include({ title: "Community clean-up test 2" })
    })

    it('returns 200 and no event created []', async () => {
        const req = {}
        const res = createRespond();
        Event.find = () => ({
            sort: () => ({
                lean: async () => []
            })

        });

        await getEvents(req, res)
        expect(res.statusCode).to.equal(200);
        expect(res.body.events).to.have.lengthOf(0);
    })

})


describe('getEventById', () => {

    const realFind = Event.findById;
    afterEach(() => Event.findById = realFind)

    it('returns a 404 for a malformed id without database querying', async () => {
        const req = { params: { id: 'not-an-id' } }
        const res = createRespond();
        let dbCall = false;
        Event.findById = () => { dbCall = true; }

        await getEventById(req, res);

        expect(res.statusCode).to.equal(404)
        expect(res.body).to.deep.equal({ message: 'Event not found' })
        expect(dbCall).to.equal(false)
    })

    it('returns a 404 valid ID matches no event', async () => {
        const req = { params: { id: '000000000000' } }
        const res = createRespond();
        Event.findById = () => ({ lean: async () => null })

        await getEventById(req, res);

        expect(res.statusCode).to.equal(404)
        expect(res.body).to.deep.equal({ message: 'Event not found' })
    })

    it('returns a 200 and an event', async () => {
        const id = new mongoose.Types.ObjectId().toString();
        const req = ({ params: { id } })
        const res = createRespond();
        Event.findById = () => {
            return {
                lean: async () => ({ _id: id, title: "Community clean-up test return an event", date: "14-11-2026", location: "Brisbane", purpose: "Clean local community park", startTime: "09:00", finishTime: "10:00", maxVolunteers: 8 })

            }

        }
        await getEventById(req, res);

        expect(res.statusCode).to.equal(200)
        expect(res.body.event.title).to.equal("Community clean-up test return an event")
        expect(res.body.event.date).to.equal("14-11-2026")
        expect(res.body.event.location).to.equal("Brisbane")
        expect(res.body.event.purpose).to.equal("Clean local community park")
        expect(res.body.event.startTime).to.equal("09:00")
        expect(res.body.event.finishTime).to.equal("10:00")
        expect(res.body.event.maxVolunteers).to.equal(8)
    })

})
