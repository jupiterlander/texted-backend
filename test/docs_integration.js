process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app.js');

const remove = require('../database/dbHandler').remove;

chai.should();

chai.use(chaiHttp);

// Delete all docs in DB before tests
before('Delete all docs in DB', async () => {
    await remove();
});

describe('Docs', () => {
    let lastId = null;
    let lastDocument = "";

    describe('GET /docs/alldocs', () => {
        it('200 Empty DB - empty array', (done) => {
            chai.request(server)
                .get("/docs/all")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.msg.should.be.an("array");
                    res.body.data.msg.should.have.lengthOf(0);
                    done();
                });
        });
    });

    describe('POST /docs/store', () => {
        it('200 HAPPY PATH', (done) => {
            chai.request(server)
                .post("/docs/store")
                .send({
                    document: "<p>Test POST /docs/store</p>"
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.msg.should.be.an("object");
                    res.body.data.msg.acknowledged.should.equal(true);
                    res.body.data.msg.insertedId.should.be.an("string");
                    
                    lastId = res.body.data.msg.insertedId;
                    done();
                });
        });
    });

    describe('PUT /docs/update', () => {
        it('200 HAPPY PATH', (done) => {
            lastDocument = "<p>Test UPDATE /docs/update</p>";

            chai.request(server)
                .put("/docs/update")
                .send({
                        _id: lastId,
                        document: lastDocument
                    }
                )
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.msg.should.be.an("object");
                    res.body.data.msg.acknowledged.should.equal(true);
                    done();
                });
        });
    });

    describe('GET /docs/find', () => {
        it('200 HAPPY PATH', (done) => {
            chai.request(server)
                .get(`/docs/find/${lastId}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.data.should.be.an("object");
                    res.body.data.msg.should.be.an("object");
                    res.body.data.msg._id.should.equal(lastId);
                    res.body.data.msg.document.should.equal(lastDocument);
                    done();
                });
        });
    });
});