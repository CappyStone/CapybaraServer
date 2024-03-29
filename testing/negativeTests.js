const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = require('assert');
const app = require('../index.js');
const should = chai.should();
const _ = require("lodash");

chai.use(chaiHttp);

const timeout = 4000; //time in ms, arbitrarily chosen as default 2000 is not always enough (~3% fail rate)

describe('API Negative Tests', function () {
    this.timeout(timeout);
    describe('Read Methods', function () {
        it('/getCompanyData', (done) => {
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

        it('/getCompanyByContactEmail', (done) => {
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

        it('/getEquipmentData', (done) => {
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

        it('/isEmployeeAdmin', (done) => {
            chai.request(app)
                .post('/isEmployeeAdmin')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property("error");
                    assert.equal(res.body.error, "Unable to verify permissions.");
                    done();
                });
        });

        it('/getAssociatedCompanies', (done) => {
            chai.request(app)
                .post('/getAssociatedCompanies')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(_.isEmpty(res.body), true);
                    done();
                });
        });

        it('/getVehicleConfig', (done) => {
            chai.request(app)
                .post('/getVehicleConfig')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(_.isEmpty(res.body), true);
                    done();
                });
        });

        it('/getCompanyVehicles', (done) => {
            chai.request(app)
                .post('/getCompanyVehicles')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    assert.equal(_.isEmpty(res.body[0]), true);
                    done();
                });
        });
        
        it('/getTripsForCompany', (done) => {
            chai.request(app)
                .post('/getTripsForCompany')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(_.isEmpty(res.body[0]), true);
                    done();
                });
        });

        it('/getEmissionsPerVehicle', (done) => {
            chai.request(app)
                .post('/getEmissionsPerVehicle')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(_.isEmpty(res.body[0]), true);
                    done();
                });
        });

        it('/getCompanyTimeStamp', (done) => {
            chai.request(app)
                .post('/getCompanyTimeStamp')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(_.isEmpty(res.body), true);
                    done();
                });
        });

        it('/getTripData', (done) => {
            chai.request(app)
                .post('/getTripData')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    assert.equal(res.body.error, "A query error occured, check database connection");
                    done();
                });
        });

        it('/getDashboardConfig', (done) => {
            chai.request(app)
                .post('/getTripData')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    assert.equal(_.isEmpty(res.body.error), false);
                    done();
                });
        });
    });

    describe('Create Methods', function () {
        it('/createCompany', (done) => {
            chai.request(app)
                .post('/createCompany')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    assert.equal(res.body.error, "Some fields missing values");
                    done();
                });
        });
        
        /* it('/createNewEquipment', (done) => {
            chai.request(app)
                .post('/createNewEquipment')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    assert.equal(res.body.error, "Some fields missing values");
                    done();
                });
        }); */
    });

    describe('Update Methods', function () {
        it('/addEquipmentToCompany (Text Request)', (done) => {
            chai.request(app)
                .post('/addEquipmentToCompany')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    assert.equal(res.body.error, "Unable to verify permissions.");
                    done();
                });
        });

        /*it('/addEquipmentToCompany (Amount < 1)', (done) => {
            chai.request(app)
                .post('/addEquipmentToCompany')
                .send({
                    "authority": "admin@test1.com",
                    "equipmentId": 6,
                    "companyEmail": "test@test.com",
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    assert.equal(res.body.error, "Equipment needs to have an amount of at least 1");
                    done();
                });
        });*/
       
        /*
        it('/addEquipmentToCompany (Equipment Already Present)', (done) => {
            chai.request(app)
                .post('/addEquipmentToCompany')
                .send({
                    "authority": "admin@test1.com",
                    "equipmentId": "10",
                    "companyEmail": "test@test.com",
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    assert.equal(res.body.error, "Company already owns this equipment");
                    done();
                });
        });
        */

        it('/addEmployeeToCompany', (done) => {
            chai.request(app)
                .post('/addEmployeeToCompany')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    assert.equal(res.body.error, "Unable to verify permissions.");
                    done();
                });
        });

        it('/giveAdminPriviledge', (done) => {
            chai.request(app)
                .post('/giveAdminPriviledge')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    assert.equal(res.body.error, "Error occured while giving admin rights");
                    done();
                });
        });

        it('/takeAdminPriviledge', (done) => {
            chai.request(app)
                .post('/takeAdminPriviledge')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    assert.equal(res.body.error, "Error occured while removing admin rights");
                    done();
                });
        });

        it('/addTripToVehicle', (done) => {
            chai.request(app)
                .post('/addTripToVehicle')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    assert.equal(res.body.error, "Issue occured while adding trip");
                    done();
                });
        });

        it('/updateCompanyName', (done) => {
            chai.request(app)
                .post('/updateCompanyName')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    assert.equal(res.body.error, "Unable to verify permissions.");
                    done();
                });
        });

        it('/updateCompanyEmail', (done) => {
            chai.request(app)
                .post('/updateCompanyEmail')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    assert.equal(res.body.error, "Unable to verify permissions.");
                    done();
                });
        });

        it('/updateCompanyAddress', (done) => {
            chai.request(app)
                .post('/updateCompanyAddress')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    assert.equal(res.body.error, "Unable to verify permissions.");
                    done();
                });
        });

        it('/updateLicensePlate', (done) => {
            chai.request(app)
                .post('/updateLicensePlate')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    assert.equal(res.body.error, "Unable to verify permissions.");
                    done();
                });
        });

        it('/updateDashboardConfig', (done) => {
            chai.request(app)
                .post('/updateDashboardConfig')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    assert.equal(res.body.error, "Unable to verify permissions.");
                    done();
                });
        });


    });

    describe('Delete Methods', function () {
        it('/removeTripFromCompany', (done) => {
            chai.request(app)
                .post('/removeTripFromCompany')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    assert.equal(res.body.error, "Issue occured while removing trip");
                    done();
                });
        });
        
        it('/removeEquipmentFromCompany (Text Response)', (done) => {
            chai.request(app)
                .post('/removeEquipmentFromCompany')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    assert.equal(res.body.error, "Unable to verify permissions.");
                    done();
                });
        });
        
        it('/removeEmployeeFromCompany (Text Response)', (done) => {
            chai.request(app)
                .post('/removeEmployeeFromCompany')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    assert.equal(res.body.error, "Unable to verify permissions.");
                    done();
                });
        });

        it('/deleteCompany (Text Response)', (done) => {
            chai.request(app)
                .post('/deleteCompany')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    assert.equal(res.body.error, "No company found");
                    done();
                });
        });

        /* it('/deleteEquipment (Text Response)', (done) => {
            chai.request(app)
                .post('/deleteEquipment')
                .send("Random Text")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    assert.equal(res.body.error, "No equipment found");
                    done();
                });
        }); */
    });
});