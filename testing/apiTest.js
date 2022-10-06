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
    companyContainerId: "Company",
    equipmentContainerId: "Equipment",
    partitionKey: { kind: "Hash", paths: ["/contactEmail", "/equipmentId"] }
};

chai.use(chaiHttp);

const { databaseId, companyContainerId, equipmentContainerId } = databaseConfig;
const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const companyContainer = database.container(companyContainerId);
const equipmentContainer = database.container(equipmentContainerId);

const timeout = 4000; //time in ms, arbitrarily chosen as default 2000 is not always enough (~3% fail rate)

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
                    "userEmail": "admin@test2.com",
                    "companyEmail": "test2@test2.com"
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
                .post('/giveAdminPriviledge')
                .send({ "userEmail": "admin@donk.com" })
                .end((err, res) => {
                    chai.request(app)
                        .post('/addEquipmentToCompany')
                        .send({
                            "equipmentId": 6,
                            "companyEmail": "new@donk.com",
                            "authority": "admin@donk.com"
                        })
                        .end(async (err, res) => {
                            res.should.have.status(200);
                            const addedItemQuery = {
                                query: "SELECT o.amount FROM Company c Join o in c.ownedEquipment Where o.equipmentId = 6 and c.contactEmail = 'new@donk.com'"
                            };
                            var { resources: company } = await companyContainer.items.query(addedItemQuery).fetchAll();
                            assert.equal(company[0].amount, 1);
                        });
                    done();
                });

        });

    });

    describe('Delete Methods', function () {
        it('/removeEquipmentFromCompany', (done) => {
            chai.request(app)
                .post('/giveAdminPriviledge')
                .send({ "userEmail": "admin@donk.com" })
                .end((err, res) => {
                    chai.request(app)
                        .post('/removeEquipmentFromCompany')
                        .send({
                            "equipmentId": 6,
                            "companyEmail": "new@donk.com",
                            "authority": "admin@donk.com"
                        })
                        .end(async (err, res) => {
                            res.should.have.status(200);
                            const addedItemQuery = {
                                query: "SELECT c.ownedEquipment FROM Company c WHERE c.contactEmail = 'new@donk.com'"
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
                    "companyEmail": "new@donk.com",
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
                .send({ "contactEmail": "new@donk.com" })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('success');
                    assert.equal(res.body.success, "waffles has been deleted");
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
