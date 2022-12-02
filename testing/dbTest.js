const CosmosClient = require("@azure/cosmos").CosmosClient;
const assert = require('assert');

const config = require("../config");
const endpoint = config.endpoint;
const key = config.key;

//const endpoint = process.env.CUSTOMCONNSTR_CosmosAddress;
//const key = process.env.CUSTOMCONNSTR_CosmosDBString;

const databaseConfig = {
    databaseId: "greenStormTestDB",
    companyContainerId: "company",
    equipmentContainerId: "Equipment",
    partitionKey: { kind: "Hash", paths: ["/id", "/equipmentId"] }
};

const { databaseId, companyContainerId, equipmentContainerId } = databaseConfig;
const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const companyContainer = database.container(companyContainerId);
const equipmentContainer = database.container(equipmentContainerId);

const timeout = 4000; //time in ms, arbitrarily chosen as default 2000 was not enough for github actions...

const newEquipmentEntry = {
    "id": "test",
    "equipmentId": "test",
    "year": "2022",
    "productName": "Model 3",
    "vehicleClass": "Mid-size",
    "manufacturer": "TeslaTest",
    "price": "59990",
    "cityFuelConsumption": "17.8",
    "hwyFuelConsumption": "19.5",
    "combFuelConsumption": "18.6",
    "cO2Emissions": "0",
    "cO2Rating": "10",
    "smogRating": "10",
    "fuelType": "Electric"
}
const newCompanyEntry = {
    id: "id",
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
            await companyContainer.item(items[0].id, items[0].id).replace(items[0]);
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
            await companyContainer.item(addedItem[0].id, addedItem[0].id).delete()
            
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
                query: "SELECT e.id, e.equipmentId, e.category, e.productName, e.description, e.manufacturer, e.serialNumber, e.greenScore, e.efficiencyRating, e.verified FROM Equipment e Where e.manufacturer = 'TeslaTest'"
            };
    
            var { resources: items } = await equipmentContainer.items.query(querySpec).fetchAll();
            assert.equal(items[0].productName, newEquipmentEntry.productName);
            items[0].productName = "BigMac";
            //send to database
            await equipmentContainer.item(items[0].id, items[0].equipmentId).replace(items[0]);
            var { resources: items } = await equipmentContainer.items.query(querySpec).fetchAll();
            assert.equal(items[0].productName, "BigMac");
        });

        it('Delete item in Equipment Container', async function () {
            const querySpec = {
                query: "SELECT * FROM Equipment e"
            };
            
    
            var { resources: items } = await equipmentContainer.items.query(querySpec).fetchAll();
            var oldLength = items.length;
            
            const addedItemQuery = {
                query: "SELECT e.id, e.equipmentId FROM Equipment e Where e.manufacturer = 'TeslaTest' AND e.productName = 'Model 3'"
            };
            var { resources: addedItem } = await equipmentContainer.items.query(addedItemQuery).fetchAll();
            await equipmentContainer.item(addedItem[0].id, addedItem[0].equipmentId).delete()
            
            var { resources: items } = await equipmentContainer.items.query(querySpec).fetchAll();
            assert.equal(items.length, oldLength - 1);
        });
    });
});