const CosmosClient = require("@azure/cosmos").CosmosClient;
const assert = require('assert');
const config = require("../config");

const endpoint = config.endpoint;
const key = config.key;

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
    describe('Company Container', function () {
        it('Querying Company Container', async function () {
            const querySpec = {
                query: "SELECT * FROM Company c Where c.id = '1'"
            };
    
            // read all items in the Items container
            const { resources: items } = await companyContainer.items.query(querySpec).fetchAll();
        
            assert.notEqual(items.length, 0);
        });
        it('Adding item to Company Container', async function () {
            const querySpec = {
                query: "SELECT * FROM Company c"
            };
    
            // read all items in the Items container
            var { resources: items } = await companyContainer.items.query(querySpec).fetchAll();
            var oldLength = items.length;

            await companyContainer.items.create(newCompanyEntry);

            var { resources: items } = await companyContainer.items.query(querySpec).fetchAll();
            assert.equal(items.length, oldLength + 1)
        });
    });

    describe('Equipment Container', function () {
        it('Querying Equipment Container', async function () {
            const querySpec = {
                query: "SELECT * FROM Equipment e Where e.id = '1'"
            };
    
            // read all items in the Items container
            const { resources: items } = await equipmentContainer.items.query(querySpec).fetchAll();
        
            assert.notEqual(items.length, 0);
        });
        
    });
});