const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = require('assert');
const app = require('../index.js');
const should = chai.should();
const _ = require("lodash");

chai.use(chaiHttp);

const timeout = 4000; //time in ms, arbitrarily chosen as default 2000 is not always enough (~3% fail rate)
// giveAdminPriviledge, takeAdminPriviledge, 

describe('API Negative Tests', function () {
    this.timeout(timeout);
    describe('Fetch Methods', function () {
        it('POST /getCompanyData', (done) => {
            chai.request(app)
                .post('/getCompanyData')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(_.isEmpty(res.body), true);
                    done();
                });
        });

        it('POST /getCompanyByContactEmail', (done) => {
            chai.request(app)
                .post('/getCompanyByContactEmail')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(_.isEmpty(res.body), true);
                    done();
                });
        });

        it('POST /getEquipmentData', (done) => {
            chai.request(app)
                .post('/getEquipmentData')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(_.isEmpty(res.body), true);
                    done();
                });
        });

        it('POST /isEmployeeAdmin', (done) => {
            chai.request(app)
                .post('/isEmployeeAdmin')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(_.isEmpty(res.body), true);
                    done();
                });
        });
    });

    describe('Update Methods', function () {
        it('POST /createCompany', (done) => {
            chai.request(app)
                .post('/createCompany')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(res.body.error, "Some fields missing values");
                    done();
                });
        });
        
        it('POST /createNewEquipment', (done) => {
            chai.request(app)
                .post('/createNewEquipment')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(res.body.error, "Some fields missing values");
                    done();
                });
        });

        it('POST /addEquipmentToCompany (Text Request)', (done) => {
            chai.request(app)
                .post('/addEquipmentToCompany')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(res.body.error, "Could not find equipment or company");
                    done();
                });
        });

        it('POST /addEquipmentToCompany (Amount < 1)', (done) => {
            chai.request(app)
                .post('/addEquipmentToCompany')
                .send({
                    "equipmentIdentifier": 6,
                    "contactEmail": "test@test.com",
                    "amountOfEquipment": 0
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(res.body.error, "Equipment needs to have an amount of at least 1");
                    done();
                });
        });
        
        it('POST /addEquipmentToCompany (Equipment Already Present)', (done) => {
            chai.request(app)
                .post('/addEquipmentToCompany')
                .send({
                    "equipmentIdentifier": 2,
                    "contactEmail": "test@test.com",
                    "amountOfEquipment": 1
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(res.body.error, "Company already owns this equipment");
                    done();
                });
        });

        it('POST /updateEquipmentAmountInCompany (Text Request)', (done) => {
            chai.request(app)
                .post('/updateEquipmentAmountInCompany')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(res.body.error, "Could not find equipment or company");
                    done();
                });
        });

        it('POST /updateEquipmentAmountInCompany (Amount < 1)', (done) => {
            chai.request(app)
                .post('/updateEquipmentAmountInCompany')
                .send({
                    "equipmentIdentifier": 6,
                    "contactEmail": "test@test.com",
                    "amountOfEquipment": 0
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(res.body.error, "Equipment needs to have an amount of at least 1");
                    done();
                });
        });

        it('POST /addEmployeeToCompany', (done) => {
            chai.request(app)
                .post('/addEmployeeToCompany')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(res.body.error, "Issue occured while adding employee");
                    done();
                });
        });

        it('POST /giveAdminPriviledge', (done) => {
            chai.request(app)
                .post('/giveAdminPriviledge')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(res.body.error, "Error occured while giving admin rights");
                    done();
                });
        });

        it('POST /takeAdminPriviledge', (done) => {
            chai.request(app)
                .post('/takeAdminPriviledge')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(res.body.error, "Error occured while removing admin rights");
                    done();
                });
        });
    });

    describe('Delete Methods', function () {
        it('POST /removeEquipmentFromCompany (Text Response)', (done) => {
            chai.request(app)
                .post('/removeEquipmentFromCompany')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(res.body.error, "Could not find equipment or company");
                    done();
                });
        });
        
        it('POST /removeEmployeeFromCompany (Text Response)', (done) => {
            chai.request(app)
                .post('/removeEmployeeFromCompany')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(res.body.error, "Employee not found");
                    done();
                });
        });
    });
});