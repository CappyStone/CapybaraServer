const CosmosClient = require("@azure/cosmos").CosmosClient;
const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = require('assert');
const app = require('../index.js');
const should = chai.should();
const _ = require("lodash");

//const config = require("../config");
//const endpoint = config.endpoint;
//const key = config.key;
const endpoint = process.env.CUSTOMCONNSTR_CosmosAddress;
const key = process.env.CUSTOMCONNSTR_CosmosDBString;


const databaseConfig = {
    databaseId: "greenStormDB",
    companyContainerId: "company",
    equipmentContainerId: "Equipment",
    partitionKey: { kind: "Hash", paths: ["/id", "/equipmentId"] }
};

chai.use(chaiHttp);

const { databaseId, companyContainerId, equipmentContainerId } = databaseConfig;
const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const companyContainer = database.container(companyContainerId);
const equipmentContainer = database.container(equipmentContainerId);

const timeout = 4000; //time in ms, arbitrarily chosen as default 2000 is not always enough (~3% fail rate)
var ts;

describe('API Tests', function () {
    this.timeout(timeout);
    describe('Read Methods', function () {
        it('/getCompanyData', (done) => {
            chai.request(app)
                .post('/getCompanyData')
                .send({ "userEmail": "admin@test1.com" })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('employees');
                    var foundEmail = false;
                    for (var i = 0; i < res.body.employees.length; i++) {
                        if (res.body.employees[i].email === "admin@test1.com") {
                            foundEmail = true;
                        }
                    }
                    assert.equal(foundEmail, true);
                    done();
                });
        });

        it('/getCompanyByContactEmail', (done) => {
            chai.request(app)
                .post('/getCompanyByContactEmail')
                .send({ "contactEmail": "test@test.com" })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('employees');
                    var foundEmail = false;
                    if (res.body.contactEmail === "test@test.com") {
                        foundEmail = true;
                    }
                    assert.equal(foundEmail, true);
                    done();
                });
        });

        it('/getEquipmentData', (done) => {
            chai.request(app)
                .post('/getEquipmentData')
                .send({ "equipmentId": "6" })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('fuelType');
                    var foundEquipment = false;
                    if (res.body.productName === "Soul EV") {
                        foundEquipment = true;
                    }
                    assert.equal(foundEquipment, true);
                    done();
                });
        });

        it('/isEmployeeAdmin', (done) => {
            chai.request(app)
                .post('/isEmployeeAdmin')
                .send({
                    "userEmail": "admin@test1.com",
                    "companyEmail": "test@test.com"
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('isAdmin');
                    var foundAdmin = false;
                    if (res.body.isAdmin === true) {
                        foundAdmin = true;
                    }
                    assert.equal(foundAdmin, true);
                    done();
                });
        });

        it('/getAssociatedCompanies', (done) => {
            chai.request(app)
                .post('/getAssociatedCompanies')
                .send({ "userEmail": "user@test1.com" })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(_.isEmpty(res.body), false);
                    done();
                });
        });

        it('/getModels', (done) => { //tests getFilteredVehicles
            chai.request(app)
                .post('/getModels')
                .send({ 
                    "searchYear": 2018,
                    "searchMake": "Acura",
                    "searchModel": "ILX"
                 })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body["0"].should.have.property('productName');
                    var foundCar = false;
                    if (res.body["0"].productName === 'ILX') {
                        foundCar = true;
                    }
                    assert.equal(foundCar, true);
                    done();
                });
        });

        it('/getCompanyVehicles', (done) => { //tests getFilteredVehicles
            chai.request(app)
                .post('/getCompanyVehicles')
                .send({"companyEmail": "test@test.com"})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body[0].should.be.a('object');
                    res.body[0].should.have.property('licensePlate');
                    var foundLicense = false;
                    if (res.body[0].licensePlate === 'LIGMA') {
                        foundLicense = true;
                    }
                    assert.equal(foundLicense, true);
                    done();
                });
        });

        it('/getTripsForCompany', (done) => {
            chai.request(app)
                .post('/getTripsForCompany')
                .send({
                    "companyEmail": "test@test.com",
                    "licensePlate": "LIGMA"
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('LIGMA');
                    var foundEndAddress = false;
                    if (res.body.LIGMA[0].endAddress === '86 Marlborough Ave Ottawa') {
                        foundEndAddress = true;
                    }
                    assert.equal(foundEndAddress, true);
                    done();
                });
        });

        it('/getEmissionsPerVehicle', (done) => {
            chai.request(app)
                .post('/getEmissionsPerVehicle')
                .send({
                    "companyEmail": "test@test.com",
                    "licensePlate": "LIGMA"
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body['0'].should.have.property('c02');
                    var foundCO2 = false;
                    if (res.body['0'].c02 === "0.136") {
                        foundCO2 = true;
                    }
                    assert.equal(foundCO2, true);
                    done();
                });
        });

        it('/getCompanyTimeStamp', (done) => {
            chai.request(app)
                .post('/getCompanyTimeStamp')
                .send({
                    "contactEmail": "test@test.com"
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('timeStamp');
                    var timestampVal = false;
                    if (res.body.timeStamp === 1666713816322) {
                        timestampVal = true;
                    }
                    assert.equal(timestampVal, true);
                    done();
                });
        });

        it('/getTripData', (done) => {
            chai.request(app)
                .post('/getTripData')
                .send({
                    "contactEmail": "test@test.com",
                    "licensePlate": "LIGMA",
                    "properties": {
                        "values": [
                            'distance',
                            'fuelUsed',
                            'licensePlate',
                            'cO2Consumed',
                            'date'
                        ],
                        "upperTimeBound": 0,
                        "lowerTimeBound": 0
                    }
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body['0'].should.have.property('distance');
                    var distanceFound = false;
                    if (res.body['0'].distance === 0.661) {
                        distanceFound = true;
                    }
                    assert.equal(distanceFound, true);
                    done();
                });
        });

        it('/getDashboardConfig', (done) => {
            chai.request(app)
                .post('/getDashboardConfig')
                .send({
                    "compnayEmail": "test@test.com"
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(_.isEmpty(res.body), false);
                    done();
                });
        });
    });

    describe('Create Methods', function () {
        it('/createCompany', (done) => {
            chai.request(app)
                .post('/createCompany')
                .send({
                    "companyName": "waffles",
                    "companyStreet": "12 goat St",
                    "companyCity": "New Donk City",
                    "companyCountry": "Canada",
                    "companyProvinceState": "Ontario",
                    "companyPostalZipCode": "K7A7A7",
                    "companyEmail": "new@donk.com",
                    "adminEmail": "admin@donk.com"
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('employees');
                    var foundCompany = false;
                    if (res.body.companyName === "waffles") {
                        foundCompany = true;
                    }
                    assert.equal(foundCompany, true);
                    done();
                });

        });

        /* it('/createNewEquipment', (done) => {
            chai.request(app)
                .post('/createNewEquipment')
                .send({
                    "id": "API_TEST_ID",
                    "equipmentId": "API_TEST_ID",
                    "year": "2018",
                    "productName": "Greg's Lunch",
                    "vehicleClass": "Legs",
                    "manufacturer": "Greg",
                    "price": "3.50",
                    "cityFuelConsumption": "5",
                    "hwyFuelConsumption": "0",
                    "combFuelConsumption": "0",
                    "cO2Emissions": "0",
                    "cO2Rating": "10",
                    "smogRating": "10",
                    "fuelType": "Beans"
                })
                .end(async (err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('productName');
                    var foundEquipment = false;
                    if (res.body.equipmentId === "API_TEST_ID") {
                        foundEquipment = true;
                    }
                    assert.equal(foundEquipment, true);
                    done();
                });
        }); */
    });

    describe('Update Methods', function () {
        it('/addEmployeeToCompany', (done) => {
            chai.request(app)
                .post('/addEmployeeToCompany')
                .send({
                    "companyEmail": "new@donk.com",
                    "newEmployeeEmail": "apitest@donk.com",
                    "isAdmin": "false",
                    "authority": "admin@donk.com"
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('employees');
                    var foundEmployee = false;
                    for (var i = 0; i < res.body.employees.length; i++) {
                        if (res.body.employees[i].email === "apitest@donk.com") {
                            foundEmployee = true;
                        }
                    }
                    assert.equal(foundEmployee, true);
                    done();
                });
        });

        it('/giveAdminPriviledge', (done) => {
            chai.request(app)
                .post('/giveAdminPriviledge')
                .send({ "userEmail": "apitest@donk.com" })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('employees');
                    var adminTrue = false;
                    for (var i = 0; i < res.body.employees.length; i++) {
                        if (res.body.employees[i].email === "apitest@donk.com" && res.body.employees[i].isAdmin === true) {
                            adminTrue = true;
                        }
                    }
                    assert.equal(adminTrue, true);
                    done();
                });
        });

        it('/takeAdminPriviledge', (done) => {
            chai.request(app)
                .post('/takeAdminPriviledge')
                .send({ "userEmail": "apitest@donk.com" })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('employees');
                    var adminFalse = false;
                    for (var i = 0; i < res.body.employees.length; i++) {
                        if (res.body.employees[i].email === "apitest@donk.com" && res.body.employees[i].isAdmin === false) {
                            adminFalse = true;
                        }
                    }
                    assert.equal(adminFalse, true);
                    done();
                });
        });

        it('/addEquipmentToCompany', (done) => {
            chai.request(app)
                .post('/addEquipmentToCompany')
                .send({
                    "equipmentId": "6",
                    "licensePlate": "JOEMAMA",
                    "companyEmail": "new@donk.com",
                    "authority": "admin@donk.com"
                })
                .end(async (err, res) => {
                    res.should.have.status(200);
                    const addedItemQuery = {
                        query: "SELECT c.ownedEquipment FROM Company c Where c.contactEmail = 'new@donk.com'"
                    };
                    var { resources: equipmentList } = await companyContainer.items.query(addedItemQuery).fetchAll();
                    assert.equal(equipmentList.length, 1);
                    done();
                });

        });

        it('/addTripToVehicle', (done) => {
            chai.request(app)
                .post('/addTripToVehicle')
                .send({
                    "companyEmail": "new@donk.com",
                    "licencePlate": "JOEMAMA",
                    "startAddress": "160 Chapel Ottawa",
                    "endAddress": "84 Marlborough Ave Ottawa",
                    "currentUser": "admin@donk.com"
                })
                .end(async (err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    const addedItemQuery = {
                        query: "SELECT c.ownedEquipment FROM Company c Where c.contactEmail = 'new@donk.com'"
                    };
                    var { resources: equipmentList } = await companyContainer.items.query(addedItemQuery).fetchAll();
                    ts = equipmentList[0].ownedEquipment[0].date;
                    assert.equal(equipmentList[0].ownedEquipment[0].trips.length, 1);
                    done();
                });

        });

        it('/updateCompanyName', (done) => {
            chai.request(app)
                .post('/updateCompanyName')
                .send({
                    "contactEmail": "new@donk.com",
                    "newCompanyName": "pancakes",
                    "authority": "admin@donk.com"
                })
                .end(async (err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    const nameQuery = {
                        query: "SELECT c.companyName FROM Company c Where c.contactEmail = 'new@donk.com'"
                    };
                    var { resources: companyList } = await companyContainer.items.query(nameQuery).fetchAll();
                    assert.equal(companyList[0].companyName, "pancakes");
                    done();
                });

        });

        it('/updateCompanyEmail', (done) => {
            chai.request(app)
                .post('/updateCompanyEmail')
                .send({
                    "contactEmail": "new@donk.com",
                    "newCompanyEmail": "new@donk2.com",
                    "authority": "admin@donk.com"
                })
                .end(async (err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    const nameQuery = {
                        query: "SELECT c.companyName FROM Company c Where c.companyName = 'pancakes'"
                    };
                    var { resources: companyList } = await companyContainer.items.query(nameQuery).fetchAll();
                    assert.equal(companyList[0].contactEmail, "new@donk2.com");
                    done();
                });

        });

        it('/updateCompanyAddress', (done) => {
            chai.request(app)
                .post('/updateCompanyAddress')
                .send({
                    "contactEmail": "new@donk2.com",
                    "newStreet": "12 Ram Ave",
                    "newCity": "Old Donk City",
                    "newProvinceState": "Ontario",
                    "newCountry": "Canada",
                    "newPostalZipcode":"K3T8B8",
                    "authority": "admin@donk.com"
                })
                .end(async (err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    const nameQuery = {
                        query: "SELECT c.companyAddress FROM Company c Where c.companyName = 'pancakes'"
                    };
                    var { resources: companyList } = await companyContainer.items.query(nameQuery).fetchAll();
                    assert.equal(companyList[0].contactAddress.city, "Old Donk City");
                    done();
                });

        });

        it('/updateDashboardConfig', (done) => {
            chai.request(app)
                .post('/updateDashboardConfig')
                .send({
                    "companyEmail": "new@donk2.com",
                    "authority": "admin@donk.com",
                    "config": {}
                })
                .end(async (err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    assert.equal(_.isEmpty(res.body), true);
                    done();
                });

        });

    });

    describe('Delete Methods', function () {
        it('/removeTripFromCompany', (done) => {
            chai.request(app)
                .post('/removeTripFromCompany')
                .send({
                    "companyEmail": "new@donk2.com",
                    "currentUser": "admin@donk.com",
                    "timestamp": ts
                })
                .end(async (err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    const addedItemQuery = {
                        query: "SELECT o.trips FROM Company c Join o in c.ownedEquipment Where c.contactEmail = 'new@donk2.com'"
                    };
                    var { resources: equipmentList } = await companyContainer.items.query(addedItemQuery).fetchAll();
                    assert.equal(equipmentList[0].trips.length, 0);
                    done();
                });

        });
        
        it('/removeEquipmentFromCompany', (done) => {
            chai.request(app)
                .post('/giveAdminPriviledge')
                .send({ "userEmail": "admin@donk.com" })
                .end((err, res) => {
                    chai.request(app)
                        .post('/removeEquipmentFromCompany')
                        .send({
                            "equipmentId": 6,
                            "companyEmail": "new@donk2.com",
                            "authority": "admin@donk.com"
                        })
                        .end(async (err, res) => {
                            res.should.have.status(200);
                            const addedItemQuery = {
                                query: "SELECT c.ownedEquipment FROM Company c WHERE c.contactEmail = 'new@donk2.com'"
                            };
                            var { resources: companyEquipment } = await companyContainer.items.query(addedItemQuery).fetchAll();
                            var equipmentFound = false;
                            for (var i = 0; i < companyEquipment[0].ownedEquipment.length; i++) {
                                if (companyEquipment[0].ownedEquipment[i].equipmentId === 6) {
                                    equipmentFound = true;
                                }
                            }
                            assert.equal(equipmentFound, false);
                        })
                    done();
                });
        });

        it('/removeEmployeeFromCompany', (done) => {
            chai.request(app)
                .post('/removeEmployeeFromCompany')
                .send({
                    "userEmail": "apitest@donk.com",
                    "companyEmail": "new@donk2.com",
                    "authority": "admin@donk.com"
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('employees');
                    var employeeFound = false;
                    for (var i = 0; i < res.body.employees.length; i++) {
                        if (res.body.employees[i].email === "apitest@donk.com") {
                            employeeFound = true;
                        }
                    }
                    assert.equal(employeeFound, false);
                    done();
                });
        });

        it('/deleteCompany', (done) => {
            chai.request(app)
                .post('/deleteCompany')
                .send({ "contactEmail": "new@donk2.com" })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('success');
                    assert.equal(res.body.success, "pancakes has been deleted");
                    done();
                });
        });

        /* it('/deleteEquipment', (done) => {
            chai.request(app)
                .post('/deleteEquipment')
                .send({ "equipmentId": "API_TEST_ID" })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('success');
                    assert.equal(res.body.success, "Greg's Lunch has been deleted");
                    done();
                });
        }); */
    });
});
