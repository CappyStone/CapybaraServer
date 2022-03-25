const CosmosClient = require("@azure/cosmos").CosmosClient;

const endpoint = process.env.CUSTOMCONNSTR_CosmosAddress;
const key = process.env.CUSTOMCONNSTR_CosmosDBString;
// const config = require("./config");
// const endpoint = config.endpoint;
// const key = config.key;

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

    try {
        // query to return all items
        const querySpec = {
            query: "SELECT c.id, c.companyName, c.employees, c.contactEmail, c.ownedEquipment FROM Company c Join e in c.employees Where e.email = '" + userEmail + "'"
        };

        // read all items in the Items container
        const { resources: items } = await companyContainer.items
            .query(querySpec)
            .fetchAll();

        return items[0];

    } catch (err) {
        return { error: "a query error occured, check database connection" };
    }

}

async function getCompanyByContactEmail(contactEmail) {
    try {
        // query to return all items
        const querySpec = {
            query: "SELECT c.id, c.companyName, c.employees, c.contactEmail, c.ownedEquipment FROM Company c Where c.contactEmail = '" + contactEmail + "'"
        };

        // read all items in the Items container
        const { resources: items } = await companyContainer.items
            .query(querySpec)
            .fetchAll();
        return items[0];
    } catch (err) {
        return { error: "an error occured, check database connection" };
    }
}

async function addEmployeeToCompany(companyEmail, newEmployeeEmail, isAdmin) {

    try {
        // query for company 
        const querySpec = {
            query: "SELECT c.id, c.companyName, c.contactEmail, c.companyAddress, c.employees, c.ownedEquipment FROM Company c Join e in c.employees Where c.contactEmail = '" + companyEmail + "'"
        };

        // read all items in the Items container
        const { resources: items } = await companyContainer.items
            .query(querySpec)
            .fetchAll();

        //grab current list of employees
        var newEmployees = items[0].employees;

        //add new employee
        newEmployees.push({ "email": newEmployeeEmail, "isAdmin": isAdmin });

        //add new employee list to company
        items[0].employees = newEmployees;

        //send to database
        const { resource: updatedItem } = await companyContainer
            //id and partition key 
            .item(items[0].id, items[0].contactEmail)
            // new json object to replace the one in the database
            .replace(items[0]);

        //return updated item
        return updatedItem;
    } catch (e) {
        return { error: "issue occured while adding employee" };
    }
}

async function removeEmployeeFromCompany(userEmail) {

    console.log(`creating removing entry`);

    // query for company 
    const querySpec = {
        query: "SELECT c.id, c.companyName, c.contactEmail, c.companyAddress, c.employees, c.ownedEquipment FROM Company c Join e in c.employees Where e.email = '" + userEmail + "'"
    };

    // read all items in the Items container
    const { resources: items } = await companyContainer.items
        .query(querySpec)
        .fetchAll();

    try {
        //grab current list of employees
        var employees = items[0].employees;
        var newEmployeeList = [];
        var admins = employees.filter(employee => employee.isAdmin);
        console.log("Admins found: " + admins.length);

        employees.forEach(employee => {
            if (employee.email != userEmail || (employee.isAdmin && admins.length <= 1)) {
                newEmployeeList.push(employee);
            }
        });
    } catch (e) {
        return { error: "employee not found" };
    }

    //add new employee list to company
    items[0].employees = newEmployeeList;

    //send to database
    const { resource: updatedItem } = await companyContainer
        //id and partition key 
        .item(items[0].id, items[0].contactEmail)
        // new json object to replace the one in the database
        .replace(items[0]);

    //return updated item
    return updatedItem;
}


async function createNewCompany(companyName, companyStreet, companyCity, companyProvinceState, companyCountry, companyPostalZipCode, companyEmail, adminEmail) {
    console.log(`Creating new company`);

    try {
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

        //push json to database to make company
        const { resource: createdItem } = await companyContainer.items.create(newCompany);

    } catch (e) {
        return { error: "error occured while creating company" };
    }
}

async function createNewEquipment(category, productName, description, manufacturer, serialNumber, greenScore, efficiencyRating, estimatedPrice, verified) {
    try {
        const querySpec = {
            query: "SELECT top 1 c.equipmentId FROM c ORDER BY c.equipmentId DESC"
        };

        const { resources: items } = await equipmentContainer.items
            .query(querySpec)
            .fetchAll();

        console.log(`Creating new equiment`);

        var latestId = items[0].equipmentId;

        latestId = latestId + 1;

        //new json file for equipment
        const newEquipment = {
            id: "",
            equipmentId: latestId,
            category: category,
            productName: productName,
            description: description,
            manufacturer: manufacturer,
            serialNumber: serialNumber,
            greenScore: greenScore,
            efficiencyRating: efficiencyRating,
            estimatedPrice: estimatedPrice,
            verified: verified,
            tags: [
            ],
        };

        //push json to database to create piece of equipment in equipment DB
        const { resource: createdItem } = await equipmentContainer.items.create(newEquipment);
        return createdItem;
    } catch (err) {
        return { error: "erorr occured while creating equipment" };
    }
}

async function getEquipmentData(equipmentId) {
    console.log("Querying container: Equipment");


    try {
        // query to return all items
        const querySpec = {
            query: "SELECT e.productName, e.greenScore, e.estimatedPrice, e.description, e.equipmentId FROM Equipment e WHERE e.equipmentId = " + equipmentId
        };

        // read all items in the Items container
        const { resources: items } = await equipmentContainer.items
            .query(querySpec)
            .fetchAll();
        return items[0];

    } catch (err) {
        return { error: "error occured while finding equipment, check connection" }
    }

}

async function addEquipmentToCompany(equipmentIdentifier, userEmail, amountOfEquipment) {
    console.log("Adding equipment to company in container: Company");

    // query to return all items
    const companyUpdating = await this.getCompanyByContactEmail(userEmail);
    const equipmentAdding = await this.getEquipmentData(equipmentIdentifier)

    if (companyUpdating == null || equipmentAdding == null) {
        return { error: 'couldnt find equipment or company' };
    } if (amountOfEquipment < 1) {
        return { error: 'equipment needs to have an amount of at least 1' };
    }

    if (companyUpdating.ownedEquipment.find(x => x.equipmentId == equipmentIdentifier) != null) {
        return { error: 'company already owns this equipment' };
    }
    const newEquipmentItem = { equipmentId: equipmentIdentifier, amount: amountOfEquipment }
    console.log('wellness check');
    var equipmentHolder = companyUpdating.ownedEquipment;
    equipmentHolder.push(newEquipmentItem);
    companyUpdating.ownedEquipment = equipmentHolder;

    // read all items in the Items container
    const { resources: updatedItem } = await companyContainer
        .item(companyUpdating.id, companyUpdating.contactEmail)
        // new json object to replace the one in the database
        .replace(companyUpdating);

    return updatedItem;
}

async function removeEquipmentFromCompany(equipmentIdentifier, userEmail) {
    console.log("Adding equipment to company in container: Company");

    // query to return all items
    const companyUpdating = await this.getCompanyByContactEmail(userEmail);
    const equipmentAdding = await this.getEquipmentData(equipmentIdentifier)

    if (companyUpdating == null || equipmentAdding == null || amountOfEquipment < 1) {
        return { error: 'couldnt find equipment or company' };
    }

    // const newEquipmentItem = {equipmentId: equipmentIdentifier, amount: amountOfEquipment};

    var newEquipmentHolder = companyUpdating.ownedEquipment.filter((item) => item.equipmentId !== equipmentIdentifier);

    // var equipmentHolder = companyUpdating.ownedEquipment;
    // equipmentHolder.push(newEquipmentItem);
    companyUpdating.ownedEquipment = newEquipmentHolder;

    // read all items in the Items container
    const { resources: updatedItem } = await companyContainer
        .item(companyUpdating.id, companyUpdating.contactEmail)
        // new json object to replace the one in the database
        .replace(companyUpdating);

    return updatedItem;
}

async function updateEquipmentAmountInCompany(equipmentIdentifier, userEmail, amountOfEquipment) {
    console.log("Adding equipment to company in container: Company");

    // query to return all items
    const companyUpdating = await this.getCompanyByContactEmail(userEmail);
    const equipmentAdding = await this.getEquipmentData(equipmentIdentifier)

    if (companyUpdating == null || equipmentAdding == null) {
        return { error: 'couldnt find equipment or company' };
    } if (amountOfEquipment < 1) {
        return { error: 'equipment needs to have an amount of at least 1' };
    }
    // const newEquipmentItem = {equipmentId: equipmentIdentifier, amount: amountOfEquipment};

    var indexOfItem = companyUpdating.ownedEquipment.findIndex((item) => item.equipmentId == equipmentIdentifier);
    // var equipmentHolder = companyUpdating.ownedEquipment;
    // equipmentHolder.push(newEquipmentItem);
    var equipmentHolder = companyUpdating.ownedEquipment;
    equipmentHolder[indexOfItem] = { equipmentId: equipmentIdentifier, amount: amountOfEquipment }
    companyUpdating.ownedEquipment = equipmentHolder;

    // read all items in the Items container
    const { resources: updatedItem } = await companyContainer
        .item(companyUpdating.id, companyUpdating.contactEmail)
        // new json object to replace the one in the database
        .replace(companyUpdating);

    return updatedItem;
}

async function isEmployeeAdmin(userEmail) {

    try {
        const querySpec = {
            query: "SELECT e.isAdmin FROM Company c Join e in c.employees Where e.email = '" + userEmail + "'"
        };

        const { resources: items } = await companyContainer.items
            .query(querySpec)
            .fetchAll();
        return items[0];
    } catch (err) {
        return { error: "error occured while checking admin rights, check connection" };
    }
}


async function giveAdminPriviledge(userEmail) {

    try {
        const querySpec = {
            query: "SELECT c.id, c.companyName, c.contactEmail, c.companyAddress, c.employees, c.ownedEquipment FROM Company c Join e in c.employees Where e.email = '" + userEmail + "'"
        };

        const { resources: items } = await companyContainer.items
            .query(querySpec)
            .fetchAll();

        //grab current list of employees
        var employees = items[0].employees;

        employees.forEach((element) => {
            if (element.email == userEmail) {
                element.isAdmin = true;
            }
        });

        //add new employee list to company
        items[0].employees = employees;

        //send to database
        const { resource: updatedItem } = await companyContainer
            //id and partition key 
            .item(items[0].id, items[0].contactEmail)
            // new json object to replace the one in the database
            .replace(items[0]);
        //return updated item
        return updatedItem;

    } catch (e) {
        return { error: "error occured while giving admin rights" };
    }
}

async function takeAdminPriviledge(userEmail) {

    try {
        const querySpec = {
            query: "SELECT c.id, c.companyName, c.contactEmail, c.companyAddress, c.employees, c.ownedEquipment FROM Company c Join e in c.employees Where e.email = '" + userEmail + "'"
        };

        const { resources: items } = await companyContainer.items
            .query(querySpec)
            .fetchAll();

        //grab current list of employees
        var employees = items[0].employees;

        employees.forEach((element) => {
            if (element.email == userEmail) {
                element.isAdmin = false;
            }
        });

        //add new employee list to company
        items[0].employees = employees;

        //send to database
        const { resource: updatedItem } = await companyContainer
            //id and partition key 
            .item(items[0].id, items[0].contactEmail)
            // new json object to replace the one in the database
            .replace(items[0]);
        //return updated item
        return updatedItem;

    } catch (e) {
        return { error: "error occured while removing admin rights" };
    }
}

async function getTestData() {
    console.log("Querying container: Diagnostics");

    // query to return all items
    const querySpec = {
        query: "SELECT * FROM Diagnostics d"
    };

    // read all items in the Items container
    const { resources: items } = await diagnosticsContainer.items.query(querySpec).fetchAll();

    // console.log(items);

    return items[0];


}


module.exports = { getCompanyData, getCompanyByContactEmail, getEquipmentData, getTestData, createNewCompany, createNewEquipment, addEmployeeToCompany, isEmployeeAdmin, giveAdminPriviledge, takeAdminPriviledge, addEquipmentToCompany, removeEquipmentFromCompany, updateEquipmentAmountInCompany, removeEmployeeFromCompany }; // Add any new database access functions to the export or they won't be usable


