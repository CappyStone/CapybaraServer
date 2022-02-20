const CosmosClient = require("@azure/cosmos").CosmosClient;

const endpoint = process.env.CUSTOMCONNSTR_CosmosAddress;
const key = process.env.CUSTOMCONNSTR_CosmosDBString;

//Cosmos connection for the company container
//Company database configuration
const companyConfig = {
    databaseId: "greenStormDB",
    containerId: "Company",
    equipmentContainerId: "Equipment",
    diagnosticsContainerId: "Diagnostics",
    partitionKey: { kind: "Hash", paths: ["/contactEmail", "/equipmentId", "/diagnosticsId"] }
};

// <CreateClientObjectDatabaseContainer>
const { databaseId, containerId } = companyConfig;

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const container = database.container(containerId);

//Equipment database configuration
const { equipmentContainerId } = companyConfig;

const equipmentClient = new CosmosClient({ endpoint, key });
const equipmentDatabase = equipmentClient.database(databaseId);
const equipmentContainer = equipmentDatabase.container(equipmentContainerId);

//Diagnostics database configuration
const { diagnosticsContainerId } = companyConfig;

const diagnosticsClient = new CosmosClient({ endpoint, key });
const diagnosticsDatabase = diagnosticsClient.database(databaseId);
const diagnosticsContainer = diagnosticsDatabase.container(diagnosticsContainerId);


async function getCompanyData(userEmail) {
    console.log(`Querying container: Items`);

    // query to return all items
    const querySpec = {
        query: "SELECT c.id, c.companyName, c.employees, c.contactEmail, c.ownedEquipment FROM Company c Join e in c.employees Where e.email = '" + userEmail + "'"
    };

    // read all items in the Items container
    const { resources: items } = await container.items
        .query(querySpec)
        .fetchAll();

    return items[0];
}

async function createNewCompany(companyName, companyStreet, companyCity, companyProvinceState, companyCountry, companyPostalZipCode, email) {
    console.log(`Creating new company`);

    const newCompany = {
        id: "",
        companyName: companyName,
        contactEmail: email,
        companyAddress: {
            street: companyStreet,
            city: companyCity,
            provinceState: companyProvinceState,
            country: companyCountry,
            postalZipcode: companyPostalZipCode
            },
        employees: [
        {
            email: email,
            isAdmin: true
        },
        
        ],
        ownedEquipment: [
        ],
    };

      /** Create new item
    * newItem is defined at the top of this file
    */
    const { resource: createdItem } = await container.items.create(newCompany);

}

async function getEquipmentData(equipmentId) {
    console.log("Querying container: Equipment");

    // query to return all items
    const querySpec = {
        query: "SELECT e.productName, e.greenScore, e.estimatedPrice, e.description FROM Equipment e WHERE e.equipmentId = " + equipmentId
    };

    // read all items in the Items container
    const { resources: items } = await equipmentContainer.items
        .query(querySpec)
        .fetchAll();


    return items[0];
}

async function getTestData() {
    console.log("Querying container: Diagnostics");

    // query to return all items
    const querySpec = {
        query: "SELECT * FROM Diagnostics d"
    };

    // read all items in the Items container
    const { resources: items } = await diagnosticsContainer.items.query(querySpec).fetchAll();

    console.log(items);

    return items[0];
}

module.exports = { getCompanyData, getEquipmentData, getTestData, createNewCompany }; // Add any new database access functions to the export or they won't be usable