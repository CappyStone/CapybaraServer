const CosmosClient = require("@azure/cosmos").CosmosClient;
var nodemailer = require('nodemailer');

const endpoint = process.env.CUSTOMCONNSTR_CosmosAddress;
const key = process.env.CUSTOMCONNSTR_CosmosDBString;
const emailpass = process.env.CUSTOMCONNSTR_EmailPass;
//const config = require("./config");
//const endpoint = config.endpoint;
//const key = config.key;
//const emailpass = config.emailpass;

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
        return { error: "A query error occured, check database connection" };
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
        return { error: "An error occured, check database connection" };
    }
}

async function getAssociatedCompanies(userEmail) {
    try {
        // query to return all items
        const querySpec = {
            query: "SELECT c.id, c.companyName, c.employees, c.contactEmail, c.ownedEquipment FROM Company c"
        };

        // read all items in the Items container
        const { resources: items } = await companyContainer.items
            .query(querySpec)
            .fetchAll();

        // console.log(userEmail);
        return items.filter(item => {
            return item.employees.findIndex(employee => employee.email === userEmail) >= 0;
        })
    } catch (err) {
        return { error: "An error occured, check database connection" };
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

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'noreply.greenstorm@gmail.com',
                pass: emailpass
            }
        });

        var mailOptions = {
            from: 'noreply.greenstorm@gmail.com',
            to: newEmployeeEmail,
            subject: 'You have been invited to join Greenstorm',
            html: '<body style="background:#b3be9dff;font-family:verdana, sans-serif; padding:20px;"><h1 style="color:#054a29ff; font-family: Arial; text-align:center;">Welcome to Greenstorm</h1><p style="color:black">The Admin for your organization has invited you to use Greenstorm to collaborate with them. Click on the button below to set up your account and get started:</p><button style="background:#d5d5d7ff; color:#054a29ff; border-radius: 2px; font-size: 20px; padding: 15px 32px; border: 2px solid #054a29ff; margin:auto; display:block;"><a href="https://www.greenstorm.xyz" style="background:#d5d5d7ff; color:#054a29ff;">Setup account</a></button><p style="color:black">If you have any questions please reach out to the Admin of your organization. Our customer success team is also on standby.</p><p style="color:black">Welcome aboard,</p><p style="color:black">The Greenstorm team</p></body>'
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        return updatedItem;
    } catch (e) {
        return { error: "Issue occured while adding employee" };
    }
}

async function removeEmployeeFromCompany(userEmail) {

    //console.log(`creating removing entry`);

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
        return { error: "Employee not found" };
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
    //console.log(`Creating new company`);

    try {
        //new json file for company
        if (companyName == null || companyStreet == null || companyCity == null || companyProvinceState == null || companyCountry == null || companyPostalZipCode == null || companyEmail == null || adminEmail == null) {
            return { error: 'Some fields missing values' };
        }
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
        return { error: "Error occured while creating company" };
    }
}

async function createNewEquipment(category, productName, description, manufacturer, serialNumber, greenScore, efficiencyRating, estimatedPrice, verified) {
    try {
        if (category == null || productName == null || description == null || manufacturer == null || serialNumber == null || greenScore == null || efficiencyRating == null || estimatedPrice == null || verified == null) {
            return { error: 'Some fields missing values' };
        }
        const querySpec = {
            query: "SELECT top 1 c.equipmentId FROM c ORDER BY c.equipmentId DESC"
        };

        const { resources: items } = await equipmentContainer.items
            .query(querySpec)
            .fetchAll();

        //console.log(`Creating new equiment`);

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
        return { error: "Erorr occured while creating equipment" };
    }
}

async function getEquipmentData(equipmentId) {
    //console.log("Querying container: Equipment");


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
        return { error: "Error occured while finding equipment, check connection" }
    }

}

async function addEquipmentToCompany(equipmentIdentifier, contactEmail, amountOfEquipment) {
    //console.log("Adding equipment to company in container: Company");

    // query to return all items
    const companyUpdating = await this.getCompanyByContactEmail(contactEmail);
    const equipmentAdding = await this.getEquipmentData(equipmentIdentifier)

    if (companyUpdating == null || equipmentAdding == null) {
        return { error: 'Could not find equipment or company' };
    } if (amountOfEquipment < 1) {
        return { error: 'Equipment needs to have an amount of at least 1' };
    }

    if (companyUpdating.ownedEquipment.find(x => x.equipmentId == equipmentIdentifier) != null) {
        return { error: 'Company already owns this equipment' };
    }
    const newEquipmentItem = { equipmentId: equipmentIdentifier, amount: amountOfEquipment }

    companyUpdating.ownedEquipment.push(newEquipmentItem);

    // read all items in the Items container
    const { resources: updatedItem } = await companyContainer
        .item(companyUpdating.id, companyUpdating.contactEmail)
        // new json object to replace the one in the database
        .replace(companyUpdating);

    return updatedItem;
}

async function removeEquipmentFromCompany(equipmentIdentifier, contactEmail) {

    // query to return all items
    const companyUpdating = await this.getCompanyByContactEmail(contactEmail);
    const equipmentAdding = await this.getEquipmentData(equipmentIdentifier)

    if (companyUpdating == null || equipmentAdding == null) {
        return { error: 'Could not find equipment or company' };
    }

    var newEquipmentHolder = companyUpdating.ownedEquipment.filter((item) => item.equipmentId !== equipmentIdentifier);

    companyUpdating.ownedEquipment = newEquipmentHolder;

    // read all items in the Items container
    const { resources: updatedItem } = await companyContainer
        .item(companyUpdating.id, companyUpdating.contactEmail)
        // new json object to replace the one in the database
        .replace(companyUpdating);

    return updatedItem;
}

async function updateEquipmentAmountInCompany(equipmentIdentifier, contactEmail, amountOfEquipment) {
    //console.log("Adding equipment to company in container: Company");

    // query to return all items
    const companyUpdating = await this.getCompanyByContactEmail(contactEmail);
    const equipmentAdding = await this.getEquipmentData(equipmentIdentifier)

    if (companyUpdating == null || equipmentAdding == null) {
        return { error: 'Could not find equipment or company' };
    } if (amountOfEquipment < 1) {
        return { error: 'Equipment needs to have an amount of at least 1' };
    }

    var indexOfItem = companyUpdating.ownedEquipment.findIndex((item) => item.equipmentId == equipmentIdentifier);

    companyUpdating.ownedEquipment[indexOfItem].amount = amountOfEquipment;

    // read all items in the Items container
    const { resources: updatedItem } = await companyContainer
        .item(companyUpdating.id, companyUpdating.contactEmail)
        // new json object to replace the one in the database
        .replace(companyUpdating);

    return updatedItem;
}

async function isEmployeeAdmin(userEmail, companyEmail) {
    try {
        if (!userEmail || !companyEmail) {
            throw new Error("Unable to verify permissions.")
        }

        const querySpec = {
            query: "SELECT e.isAdmin FROM Company c Join e in c.employees Where c.contactEmail = '" + companyEmail + "' and e.email = '" + userEmail + "'"
        };

        const { resources: items } = await companyContainer.items
            .query(querySpec)
            .fetchAll();

        // console.log(items);
        return items[0].isAdmin;
    } catch (err) {
        // console.log(err);
        return { error: err };
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
        return { error: "Error occured while giving admin rights" };
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
        return { error: "Error occured while removing admin rights" };
    }
}

async function deleteCompany(contactEmail) {
    try {
        //console.log(`Deleting company`);
        // query for company 
        const querySpec = {
            query: "SELECT c.id, c.companyName, c.contactEmail, c.companyAddress, c.employees, c.ownedEquipment FROM Company c Where c.contactEmail = '" + contactEmail + "'"
        };

        // read all items in the Items container
        const { resources: items } = await companyContainer.items
            .query(querySpec)
            .fetchAll();

        /**
     * Delete item
     * Pass the id and partition key value to delete the item
     */

        if (items.length <= 0) {
            return { error: "No company found" };
        }

        const { resource: result } = await companyContainer.item(items[0].id, items[0].contactEmail).delete();

        return { success: items[0].companyName + " has been deleted" };
    } catch (e) {
        return { error: "Error occured while deleting company" };
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


module.exports = { getCompanyData, getCompanyByContactEmail, getAssociatedCompanies, getEquipmentData, getTestData, createNewCompany, createNewEquipment, addEmployeeToCompany, isEmployeeAdmin, giveAdminPriviledge, takeAdminPriviledge, addEquipmentToCompany, removeEquipmentFromCompany, updateEquipmentAmountInCompany, removeEmployeeFromCompany, deleteCompany }; // Add any new database access functions to the export or they won't be usable



