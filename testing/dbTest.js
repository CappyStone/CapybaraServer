const CosmosClient = require("@azure/cosmos").CosmosClient;
const assert = require('assert');
//const config = require("../config");

const endpoint = secrets.COSMOSADDRESS;
const key = secrets.COSMOSDBSTRING;

const databaseConfig = {
    databaseId: "greenStormTestDB",
    companyContainerId: "Company",
    equipmentContainerId: "Equipment",
    partitionKey: { kind: "Hash", paths: ["/contactEmail", "/equipmentId"] }
};

const { databaseId, companyContainerId, equipmentContainerId } = databaseConfig;
const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const companyContainer = database.container(companyContainerId);
const equipmentContainer = database.container(equipmentContainerId);

const timeout = 8000; //time in ms, arbitrarily chosen as default 2000 was not enough for github actions...

const newEquipmentEntry = {
    id: "",
    equipmentId: 7,
    category: "vehicle",
    productName: "Model 3.5",
    description: "3 but more",
    manufacturer: "Teslo",
    serialNumber: "5YJ3E1EAXHF",
    greenScore: "10",
    efficiencyRating: "26kWh/100mi",
    estimatedPrice: 66130.73,
    verified: true,
    tags: [
        {
            tag: "teslo"
        },
        {
            tag: "electric vehicle"
        }
    ]
}
const newCompanyEntry = {
    id: "",
    companyName: "connectionTestSuite",
    contactEmail: "connection@testsuite.com",
    companyAddress: {
        street: "123 test St",
        city: "Testville",
        provinceState: "Nunavut",
        country: "Canada",
        postalZipcode: "T7T7T7"
        },
    employees: [
    {
        email: "admin@testsuite.com",
        isAdmin: true
    },
    
    ],
    ownedEquipment: [
    ],
};

describe('DB Connections', function () {
    this.timeout(timeout);
    describe('Company Container', function () {
        it('Querying Company Container', async function () {
            const querySpec = {
                query: "SELECT * FROM Company c"
            };
    
            const { resources: items } = await companyContainer.items.query(querySpec).fetchAll();
        
            assert.notEqual(items.length, 0);
        });

        it('Adding item to Company Container', async function () {
            const querySpec = {
                query: "SELECT * FROM Company c"
            };
    
            var { resources: items } = await companyContainer.items.query(querySpec).fetchAll();
            var oldLength = items.length;

            await companyContainer.items.create(newCompanyEntry);

            var { resources: items } = await companyContainer.items.query(querySpec).fetchAll();
            assert.equal(items.length, oldLength + 1)
        });

        it('Update item in Company Container', async function () {
            const querySpec = {
                query: "SELECT c.id, c.companyName, c.contactEmail, c.companyAddress, c.employees, c.ownedEquipment FROM Company c Where c.contactEmail = 'connection@testsuite.com'"
            };
    
            var { resources: items } = await companyContainer.items.query(querySpec).fetchAll();
            assert.equal(items[0].companyName, newCompanyEntry.companyName);
            items[0].companyName = "modifiedTestSuite";
            //send to database
            await companyContainer.item(items[0].id, items[0].contactEmail).replace(items[0]);
            var { resources: items } = await companyContainer.items.query(querySpec).fetchAll();
            assert.equal(items[0].companyName, "modifiedTestSuite");
        });

        it('Delete item in Company Container', async function () {
            const querySpec = {
                query: "SELECT * FROM Company c"
            };
            
    
            var { resources: items } = await companyContainer.items.query(querySpec).fetchAll();
            var oldLength = items.length;
            
            const addedItemQuery = {
                query: "SELECT c.id, c.companyName, c.contactEmail, c.companyAddress, c.employees, c.ownedEquipment FROM Company c Where c.contactEmail = 'connection@testsuite.com' AND c.companyName = 'modifiedTestSuite'"
            };
            var { resources: addedItem } = await companyContainer.items.query(addedItemQuery).fetchAll();
            await companyContainer.item(addedItem[0].id, addedItem[0].contactEmail).delete()
            
            var { resources: items } = await companyContainer.items.query(querySpec).fetchAll();
            assert.equal(items.length, oldLength - 1);
        });
    });

    describe('Equipment Container', function () {
        it('Querying Equipment Container', async function () {
            const querySpec = {
                query: "SELECT * FROM Equipment e"
            };
    
            const { resources: items } = await equipmentContainer.items.query(querySpec).fetchAll();
        
            assert.notEqual(items.length, 0);
        });

        it('Adding item to Equipment Container', async function () {
            const querySpec = {
                query: "SELECT * FROM Equipment e"
            };
    
            var { resources: items } = await equipmentContainer.items.query(querySpec).fetchAll();
            var oldLength = items.length;

            await equipmentContainer.items.create(newEquipmentEntry);

            var { resources: items } = await equipmentContainer.items.query(querySpec).fetchAll();
            assert.equal(items.length, oldLength + 1)
        });

        it('Update item in Equipment Container', async function () {
            const querySpec = {
                query: "SELECT e.id, e.equipmentId, e.category, e.productName, e.description, e.manufacturer, e.serialNumber, e.greenScore, e.efficiencyRating, e.verified FROM Equipment e Where e.manufacturer = 'Teslo'"
            };
    
            var { resources: items } = await equipmentContainer.items.query(querySpec).fetchAll();
            assert.equal(items[0].productName, newEquipmentEntry.productName);
            items[0].productName = "Model 3.7";
            //send to database
            await equipmentContainer.item(items[0].id, items[0].equipmentId).replace(items[0]);
            var { resources: items } = await equipmentContainer.items.query(querySpec).fetchAll();
            assert.equal(items[0].productName, "Model 3.7");
        });

        it('Delete item in Equipment Container', async function () {
            const querySpec = {
                query: "SELECT * FROM Equipment e"
            };
            
    
            var { resources: items } = await equipmentContainer.items.query(querySpec).fetchAll();
            var oldLength = items.length;
            
            const addedItemQuery = {
                query: "SELECT e.id, e.equipmentId, e.category, e.productName, e.description, e.manufacturer, e.serialNumber, e.greenScore, e.efficiencyRating, e.verified FROM Equipment e Where e.manufacturer = 'Teslo' AND e.productName = 'Model 3.7'"
            };
            var { resources: addedItem } = await equipmentContainer.items.query(addedItemQuery).fetchAll();
            await equipmentContainer.item(addedItem[0].id, addedItem[0].equipmentId).delete()
            
            var { resources: items } = await equipmentContainer.items.query(querySpec).fetchAll();
            assert.equal(items.length, oldLength - 1);
        });
    });
});
