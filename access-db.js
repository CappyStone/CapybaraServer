const CosmosClient = require("@azure/cosmos").CosmosClient;

const endpoint = process.env.CUSTOMCONNSTR_CosmosAddress;
const key = process.env.CUSTOMCONNSTR_CosmosDBString;

//Cosmos connection for the company container

//Company database configuration
const databaseConfig = {
    databaseId: "greenStormDB",
    companyContainerId: "Company",
    equipmentContainerId: "Equipment",
    diagnosticsContainerId: "Diagnostics",
    partitionKey: { kind: "Hash", paths: ["/contactEmail", "/equipmentId", "/diagnosticsId"] }
};

const { databaseId, companyContainerId, equipmentContainerId, diagnosticsContainerId } = databaseConfig;

// Company Container Config

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const companyContainer = database.container(companyContainerId);

//Equipment Container configuration

const equipmentContainer = database.container(equipmentContainerId);

//Diagnostics Container configuration

const diagnosticsContainer = database.container(diagnosticsContainerId);


async function getCompanyData(userEmail) {
    console.log(`Querying container: Items`);

    // query to return all items
    const querySpec = {
        query: "SELECT c.id, c.companyName, c.employees, c.contactEmail, c.ownedEquipment FROM Company c Join e in c.employees Where e.email = '" + userEmail + "'"
    };

    // read all items in the Items container
    const { resources: items } = await companyContainer.items
        .query(querySpec)
        .fetchAll();

    return items[0];
}

async function addEmployeeToCompany(userEmail, adminEmail, companyId, contactEmail) {
    console.log(`Querying container: Items`);

    // query to return all items
    const querySpec = {
        query: "SELECT c.id, c.companyName, c.employees, c.contactEmail, c.ownedEquipment FROM Company c Join e in c.employees Where e.email = '" + userEmail + "'"
    };

    // read all items in the Items container
    const { resources: items } = await companyContainer.items
        .query(querySpec)
        .fetchAll();

    return items[0];
}

async function createNewCompany(companyName, companyStreet, companyCity, companyProvinceState, companyCountry, companyPostalZipCode, companyEmail, adminEmail) {
    console.log(`Creating new company`);

    //new json file for company
    const newCompany = {
        id: "",
        companyName: companyName,
        contactEmail: companyEmail,
        companyAddress: {
            street: companyStreet,
            city: companyCity,
            provinceState: companyProvinceState,
            country: companyCountry,
            postalZipcode: companyPostalZipCode
            },
        employees: [
        {
            email: adminEmail,
            isAdmin: true
        },
        
        ],
        ownedEquipment: [
        ],
    };

      /** Create new item
    * newItem is defined at the top of this file
    */

      //push json to database to make company
    const { resource: createdItem } = await companyContainer.items.create(newCompany);

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