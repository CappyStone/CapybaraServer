const CosmosClient = require("@azure/cosmos").CosmosClient;
const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = require('assert');
const app = require('../index.js');
const should = chai.should();

// const config = require("../config");
// const endpoint = config.endpoint;
// const key = config.key;
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
    describe('Fetch Methods', function () {
        it('POST /getCompanyData', (done) => {
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

        it('POST /getCompanyByContactEmail', (done) => {
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

        it('POST /getEquipmentData', (done) => {
            chai.request(app)
                .post('/getEquipmentData')
                .send({ "equipmentId": "6" })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('estimatedPrice');
                    var foundEquipment = false;
                    if (res.body.productName === "Electric Drill") {
                        foundEquipment = true;
                    }
                    assert.equal(foundEquipment, true);
                    done();
                });
        });

        it('POST /isEmployeeAdmin', (done) => {
            chai.request(app)
                .post('/isEmployeeAdmin')
                .send({ "userEmail": "admin@test2.com" })
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
    });

    describe('Create / Update Methods', function () {
        it('POST /createCompany', (done) => {
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

        it('POST /createNewEquipment', (done) => {
            chai.request(app)
                .post('/createNewEquipment')
                .send({
                    "category": "tool",
                    "productName": "TESTING",
                    "description": "TESTING PURPOSES ONLY",
                    "manufacturer": "apiTEST",
                    "serialNumber": "87162",
                    "greenScore": "10",
                    "efficiencyRating": "10kWh",
                    "estimatedPrice": "99999",
                    "verified": "false"
                })
                .end(async (err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('tags');
                    var foundEquipment = false;
                    if (res.body.productName === "TESTING") {
                        foundEquipment = true;
                    }
                    assert.equal(foundEquipment, true);
                    //No api to delete equipment manually delete
                    const addedItemQuery = {
                        query: "SELECT * FROM Equipment e Where e.productName = 'TESTING'"
                    };
                    var { resources: addedItem } = await equipmentContainer.items.query(addedItemQuery).fetchAll();
                    await equipmentContainer.item(addedItem[0].id, addedItem[0].equipmentId).delete()
                    done();
                });
        });

        it('POST /addEmployeeToCompany', (done) => {
            chai.request(app)
                .post('/addEmployeeToCompany')
                .send({
                    "adminEmail": "admin@donk.com",
                    "newEmployeeEmail": "apitest@donk.com",
                    "isAdmin": "false"
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

        it('POST /giveAdminPriviledge', (done) => {
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

        it('POST /takeAdminPriviledge', (done) => {
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
    });

    describe('Delete Methods', function () {
        it('POST /removeEmployeeFromCompany', (done) => {
            chai.request(app)
                .post('/removeEmployeeFromCompany')
                .send({ "userEmail": "apitest@donk.com" })
                .end(async (err, res) => {
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
                    //No api to delete company yet, manually delete for now.....
                    //(doing so here after we are done manipulating our test company entry)
                    const addedItemQuery = {
                        query: "SELECT * FROM Company c Where c.companyName = 'waffles'"
                    };
                    var { resources: addedItem } = await companyContainer.items.query(addedItemQuery).fetchAll();
                    await companyContainer.item(addedItem[0].id, addedItem[0].contactEmail).delete()
                    done();
                });
        });
    });
});

// describe('API Negative Tests', function () {
//     this.timeout(timeout);
//     describe('Fetch Methods', function () {
//         it('POST /getCompanyData', (done) => {
//             chai.request(app)
//                 .post('/getCompanyData')
//                 .send("Random Text")
//                 .end((err, res) => {
//                     res.should.have.status(400);
//                     console.log(res.body);
//                     assert.equal(true, true);
//                     done();
//                 });
//         }); 
//     });
// });