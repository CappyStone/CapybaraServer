const CosmosClient = require("@azure/cosmos").CosmosClient;
const { concat } = require("lodash");
var nodemailer = require('nodemailer');
const axios = require("axios");
const crypto = require("crypto");

const endpoint = process.env.CUSTOMCONNSTR_CosmosAddress;
const key = process.env.CUSTOMCONNSTR_CosmosDBString;
const mapQuestKey = process.env.CUSTOMCONNSTR_MapQuestKey;
const emailpass = process.env.CUSTOMCONNSTR_EmailPass;

//const config = require("./config");
//const endpoint = config.endpoint;
//const key = config.key;
//const mapQuestKey = config.mapQuestKey;
//const emailpass = config.emailpass;

//Cosmos connection for the company container

//Company database configuration
const databaseConfig = {
    databaseId: "greenStormDB",
    companyContainerId: "company",
    equipmentContainerId: "Equipment",
    diagnosticsContainerId: "Diagnostics",
    partitionKey: { kind: "Hash", paths: ["/id", "/equipmentId", "/diagnosticsId"] }
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
            query: "SELECT c.id, c.companyName, c.employees, c.contactEmail, c.ownedEquipment, c.dashboardConfig FROM Company c Join e in c.employees Where e.email = '" + userEmail + "'"
        };

        // read all items in the Items container
        const { resources: items } = await companyContainer.items
            .query(querySpec)
            .fetchAll();

        return items[0];

    } catch (err) {
        console.log(err);
        return { error: "A query error occured, check database connection" };
    }

}

async function getCompanyByContactEmail(contactEmail) {
    try {
        // query to return all items
        const querySpec = {
            query: "SELECT c.id, c.companyName, c.contactEmail, c.companyAddress, c.employees, c.ownedEquipment, c.dashboardConfig, c._ts FROM Company c Where c.contactEmail = '" + contactEmail + "'"
        };

        // read all items in the Items container
        const { resources: items } = await companyContainer.items
            .query(querySpec)
            .fetchAll();
        return items[0];
    } catch (err) {
        console.log(err);
        return { error: "An error occured, check database connection" };
    }
}

async function getAssociatedCompanies(userEmail) {
    try {
        // query to return all items
        const querySpec = {
            query: "SELECT c.id, c.companyName, c.employees, c.contactEmail, c.ownedEquipment, c.dashboardConfig FROM Company c"
        };

        // read all items in the Items container
        const { resources: items } = await companyContainer.items
            .query(querySpec)
            .fetchAll();

        // console.log(userEmail);
        return items.filter(item => {
            return item.employees != null ? item.employees.findIndex(employee => employee.email === userEmail) >= 0 : false;
        })
    } catch (err) {
        console.log(err);
        return { error: "An error occured, check database connection" };
    }
}

async function addEmployeeToCompany(companyEmail, newEmployeeEmail, newEmployeeName, isAdmin) {
    try {
        // query for company 
        const querySpec = {
            query: "SELECT c.id, c.companyName, c.contactEmail, c.companyAddress, c.employees, c.ownedEquipment, c.dashboardConfig FROM Company c Join e in c.employees Where c.contactEmail = '" + companyEmail + "'"
        };

        // read all items in the Items container
        const { resources: items } = await companyContainer.items
            .query(querySpec)
            .fetchAll();

        //grab current list of employees
        var newEmployees = items[0].employees;


        //add new employee
        newEmployees.push({ "fullName": newEmployeeName, "email": newEmployeeEmail, "isAdmin": isAdmin });

        //add new employee list to company
        items[0].employees = newEmployees;

        //send to database
        const { resource: updatedItem } = await companyContainer
            //id and partition key 
            .item(items[0].id, items[0].id)
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
        query: "SELECT c.id, c.companyName, c.contactEmail, c.companyAddress, c.employees, c.ownedEquipment, c.dashboardConfig FROM Company c Join e in c.employees Where e.email = '" + userEmail + "'"
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
        .item(items[0].id, items[0].id)
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
            id: crypto.randomUUID(),
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
            dashboardConfig: {
                overview: [
                    {
                        title: "Kilometers Driven This Year",
                        type: "Bar",
                        keys: { x: 'date', y: 'distance' },
                        showXAxis: true,
                        showYAxis: true,
                        yUnits: "km",
                        emphasized: true
                    },
                    {
                        title: "Fuel Usage Breakdown by Vehicle",
                        type: "Pie",
                        keys: { x: 'licensePlate', y: 'fuelUsed' },
                        showXAxis: false,
                        showYAxis: false,
                        yUnits: "gal",
                        emphasized: true
                    }
                ],
                trends: [
                    {
                        title: "Fuel Usage",
                        key: "fuelUsed"
                    },
                    {
                        title: "Distance Travelled",
                        key: "distance"
                    },
                    {
                        title: "CO₂ Emissions",
                        key: "cO2Consumed"
                    },
                ]
            }
        };

        //push json to database to make company
        return await companyContainer.items.create(newCompany);

    } catch (e) {
        return { error: "Error occured while creating company" };
    }
}

async function updateCompanyName(contactEmail, newName) {
    try {

        // query to return all items
        const querySpec = {
            query: "SELECT c.id, c.companyName, c.contactEmail, c.companyAddress, c.employees, c.ownedEquipment, c.dashboardConfig FROM Company c Where c.contactEmail = '" + contactEmail + "'"
        };

        // read all items in the Items container
        const { resources: items } = await companyContainer.items
            .query(querySpec)
            .fetchAll();
        

        //add new address to company
        items[0].companyName = newName;

        //send to database
        const { resource: updatedItem } = await companyContainer
            //id and partition key 
            .item(items[0].id, items[0].id)
            // new json object to replace the one in the database
            .replace(items[0]);

        return updatedItem;

    } catch (err) {
        console.log(err);
        return { error: "An error occured, check database connection" };
    }
}

async function updateCompanyEmail(contactEmail, newContactEmail) {
    try {

        // query to return all items
        const querySpec = {
            query: "SELECT c.id, c.companyName, c.contactEmail, c.companyAddress, c.employees, c.ownedEquipment, c.dashboardConfig FROM Company c Where c.contactEmail = '" + contactEmail + "'"
        };

        // read all items in the Items container
        const { resources: items } = await companyContainer.items
            .query(querySpec)
            .fetchAll();
        

        //add new address to company
        items[0].contactEmail = newContactEmail;

        //send to database
        const { resource: updatedItem } = await companyContainer
            //id and partition key 
            .item(items[0].id, items[0].id)
            // new json object to replace the one in the database
            .replace(items[0]);

        return updatedItem;

    } catch (err) {
        console.log(err);
        return { error: "An error occured, check database connection" };
    }
}

async function updateCompanyAddress(contactEmail, newStreet, newCity, newProvinceState, newCountry, newPostalZipcode) {
    try {

        // query to return all items
        const querySpec = {
            query: "SELECT c.id, c.companyName, c.contactEmail, c.companyAddress, c.employees, c.ownedEquipment, c.dashboardConfig FROM Company c Where c.contactEmail = '" + contactEmail + "'"
        };

        // read all items in the Items container
        const { resources: items } = await companyContainer.items
            .query(querySpec)
            .fetchAll();

        //create new address
        newCompanyAddress=({ "street": newStreet, "city": newCity, "provinceState": newProvinceState, "country": newCountry, "postalZipcode": newPostalZipcode });

        //add new address to company
        items[0].companyAddress = newCompanyAddress;

        //send to database
        const { resource: updatedItem } = await companyContainer
            //id and partition key 
            .item(items[0].id, items[0].id)
            // new json object to replace the one in the database
            .replace(items[0]);

        return updatedItem;

    } catch (err) {
        console.log(err);
        return { error: "An error occured, check database connection" };
    }
}


/* async function createNewEquipment(category, productName, description, manufacturer, serialNumber, greenScore, efficiencyRating, estimatedPrice, verified) {
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
} */

async function getVehicleData() {
    try {
        // query to return all items
        const querySpec = {
            query: "SELECT e.productName, e.manufacturer, e.equipmentId, e.year FROM Equipment e"
        };

        // read all items in the Items container
        const { resources: items } = await equipmentContainer.items
            .query(querySpec)
            .fetchAll();
        return items;

    } catch (err) {
        return { error: "Error occured while finding equipment, check connection" }
    }
}

async function getFilteredVehicles(year, make, model) {
    try {
        // query to return all items
        const querySpec = {
            query: "SELECT e.productName, e.manufacturer, e.equipmentId FROM Equipment e WHERE e.manufacturer = '" + make + "' AND e.productName = '" + model + "' AND e.year = '" + year + "'"
        };

        // read all items in the Items container
        const { resources: items } = await equipmentContainer.items
            .query(querySpec)
            .fetchAll();
        return items;

    } catch (err) {
        return { error: "Error occured while finding equipment, check connection" }
    }
}

async function getEquipmentData(equipmentId) {
    //console.log("Querying container: Equipment");


    try {
        // query to return all items
        const querySpec = {
            query: "SELECT e.equipmentId, e.manufacturer, e.productName, e.vehicleClass, e.price, e.cityFuelConsumption, e.hwyFuelConsumption, e.combFuelConsumption, e.fuelType, e.cO2Emissions FROM Equipment e WHERE e.equipmentId = '" + equipmentId + "'"
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

async function addEquipmentToCompany(equipmentIdentifier, contactEmail, licensePlate) {
    //console.log("Adding equipment to company in container: Company");

    // query to return all items
    const companyUpdating = await this.getCompanyByContactEmail(contactEmail);
    const equipmentAdding = await this.getEquipmentData(equipmentIdentifier);

    if (companyUpdating == null || equipmentAdding == null) {
        return { error: 'Could not find equipment or company' };
    }

    const newEquipmentItem = { equipmentId: equipmentIdentifier, licensePlate: licensePlate, active: true, trips: [] }


    companyUpdating.ownedEquipment.push(newEquipmentItem);

    // read all items in the Items container
    const { resources: updatedItem } = await companyContainer
        .item(companyUpdating.id, companyUpdating.id)
        // new json object to replace the one in the database
        .replace(companyUpdating);

    return updatedItem;
}

async function getTripsForCompany(companyEmail, licensePlateFilter) {
    const companyToQuery = await this.getCompanyByContactEmail(companyEmail);
    if (companyToQuery === null || companyToQuery === undefined) {
        return [];
    }

    var equipmentList = companyToQuery.ownedEquipment;

    var trips = {};
    for (var i in equipmentList) {
        var vehicle = equipmentList[i];

        if (licensePlateFilter === null || licensePlateFilter === vehicle.licensePlate) {
            trips[vehicle.licensePlate] = vehicle.trips;
        }
    }

    return trips;
}

async function getCompanyTimeStamp(companyEmail) {
    const companyToQuery = await this.getCompanyByContactEmail(companyEmail);
    if (companyToQuery === null || companyToQuery === undefined) {
        return [];
    }
    var timeStamp = companyToQuery._ts * 1000;
    //cosmos does not return a javascript time stamp, must multiply for conversion
    var equipmentList = companyToQuery.ownedEquipment;
    
    if(equipmentList.length > 0){
        
        var tripList = equipmentList[0].trips; 
        
        if(tripList.length > 0){
            for (var i in tripList) {
                if(tripList[i].date < timeStamp){
                    timeStamp = tripList[i].date;
                }
            }
        }
    }

    return {"timeStamp": timeStamp};
}

async function getEmissionsPerVehicle(companyEmail, licensePlateFilter) {
    const companyToQuery = await this.getCompanyByContactEmail(companyEmail);

    if (companyToQuery === null || companyToQuery === undefined) {
        return [];
    }

    var equipmentList = companyToQuery.ownedEquipment;
    var trips = [];
    var emissions = [];

    for (var i in equipmentList) {
        var vehicle = equipmentList[i];
        if (licensePlateFilter === null || licensePlateFilter === vehicle.licensePlate) {
            trips = trips.concat(vehicle.trips);
        }
        for (var i in trips) {
            var newEntry = {
                "c02": trips[i].cO2Consumed,
                "date": trips[i].date
            };
            emissions.push(newEntry);
        }
    }
    return emissions;
}

async function getTripData(contactEmail, licensePlate, properties) {

    try {

        /* 
        default parameter values
        contactEmail: string
        licensePlate: string or null if no license plate filter needed,
        properties:{
            values: [list of strings],
            upperTimeBound: int,
            lowerTimeBound: int
        }
        */

        var queryy = "SELECT";

        if (properties.values.includes("cO2Consumed")) {
            queryy = queryy + " f.cO2Consumed,";
        }

        if (properties.values.includes("duration")) {
            queryy = queryy + " f.time,";
        }

        if (properties.values.includes("distance")) {
            queryy = queryy + " f.distance,";
        }

        if (properties.values.includes("fuelUsed")) {
            queryy = queryy + " f.fuelUsed,";
        }

        if (properties.values.includes("licensePlate")) {
            queryy = queryy + " e.licensePlate,";
        }

        queryy = queryy + " f.date FROM c join e in c.ownedEquipment JOIN f in e.trips WHERE c.contactEmail = '" + contactEmail + "'";

        if (properties.upperTimeBound > 0) {
            queryy = queryy + " and f.date < " + (properties.upperTimeBound + 86400000).toString();
        }

        if (properties.lowerTimeBound > 0) {
            queryy = queryy + " and f.date > " + properties.lowerTimeBound.toString();
        }

        if (licensePlate !== null) {
            queryy = queryy + " and e.licensePlate = '" + licensePlate + "'";
        }


        // query to return all items
        const querySpec = {
            query: queryy
        };

        // read all items in the Items container
        const { resources: items } = await companyContainer.items
            .query(querySpec)
            .fetchAll();

        return items;

    } catch (err) {
        console.log(err);
        return { error: "A query error occured, check database connection" };
    }

}

async function addTripToVehicle(companyEmail, licensePlate, currentUser, startAddress, endAddress) {
    try {
        
        if((companyEmail !==null||companyEmail!=="") && (licensePlate!==null||licensePlate!=="")&&(currentUser
        !==null||currentUser!=="")&&(startAddress!==null||startAddress!=="")&&(endAddress!==null||endAddress!=="")){
            // query for company 
            const companyUpdating = await this.getCompanyByContactEmail(companyEmail);

            //grab equipment list
            var equipmentList = companyUpdating.ownedEquipment;
            var vehicle = equipmentList.filter(vehicle => vehicle.licensePlate == licensePlate)[0];
            var vehicleMetadata = await this.getEquipmentData(vehicle.equipmentId);

            //Variable to store the conversion rate from liters/100 km to miles per gallon
            const lpk2mpg = 2.35214583;

            //Creating the URL for MapQuest API request
            var hwyEfficiencyGal = (vehicleMetadata.hwyFuelConsumption * 2.35214583)
            const mapQuestURL = "http://www.mapquestapi.com/directions/v2/route?" + new URLSearchParams({
                key: mapQuestKey,
                from: startAddress,
                to: endAddress,
                unit: "m",
                fullShape: true,
                //Fuel consumption is stored as l/100km, so it must be converted to mpg
                highwayEfficiency: hwyEfficiencyGal
            });


            var mapResult = (await axios.post(mapQuestURL)).data;

            // Amount of CO2 consumed (kilograms of CO2 per kilometer driven are used here)

            var CO2Consumed = (mapResult.route.distance * vehicleMetadata.cO2Emissions * 0.001)
            var routeCoords = [];

            //Array of coordinate pairs for the route
            var routeLegs = mapResult.route.shape.shapePoints;

            if (routeLegs.length > 1000) {
                var maneuvers = mapResult.route.shape.maneuverIndexes;
                for (var i in maneuvers) {
                    var index = maneuvers[i] * 2;

                    var latLngHolder = [routeLegs[index], routeLegs[index + 1]];
                    routeCoords.push(latLngHolder);
                }
            } else {
                for (var i = 0; i < routeLegs.length - 1; i += 2) {
                    var latLngHolder = [routeLegs[i], routeLegs[i + 1]];
                    routeCoords.push(latLngHolder);
                }
            }

            // alert(startLocation.results.locations[0].latLng)
            var newTrip = {
                "startLocation": mapResult.route.locations[0].latLng,
                "endLocation": mapResult.route.locations[(mapResult.route.locations.length - 1)].latLng,
                "date": Date.now(),
                "distance": mapResult.route.distance,
                "fuelUsed": mapResult.route.fuelUsed ? mapResult.route.fuelUsed : (mapResult.route.distance ? Math.round(mapResult.route.distance / hwyEfficiencyGal, 2) : 0),
                "fuelEstimate": mapResult.route.fuelUsed ? "MapQuest" : mapResult.route.distance ? "Estimate" : "None",
                "time": mapResult.route.time,
                "user": currentUser,
                "cO2Consumed": parseFloat(CO2Consumed.toFixed(3)),
                "routeCoords": routeCoords,
                "startAddress": startAddress,
                "endAddress": endAddress
            }
            vehicle.trips.push(newTrip);

            companyUpdating.ownedEquipment = equipmentList;

            // read all items in the Items container
            const { resources: updatedItem } = await companyContainer
                .item(companyUpdating.id, companyUpdating.id)
                // new json object to replace the one in the database
                .replace(companyUpdating);

            return updatedItem;

        }
        
    } catch (e) {
        return { error: "Issue occured while adding trip" };
    }
}

async function removeTripFromCompany(companyEmail, currentUser, timestamp) {
    try {
        // query for company 
        const companyUpdating = await this.getCompanyByContactEmail(companyEmail);

        //grab equipment list
        var equipmentList = companyUpdating.ownedEquipment;

        var isAdmin = await this.isEmployeeAdmin(currentUser, companyEmail);

        for (var i in equipmentList) {
            var vehicle = equipmentList[i];
            vehicle.trips = vehicle.trips.filter(trip => {
                return !(trip.date === timestamp && (currentUser === trip.user || isAdmin))
            });
        }

        companyUpdating.ownedEquipment = equipmentList;

        // read all items in the Items container
        const { resources: updatedItem } = await companyContainer
            .item(companyUpdating.id, companyUpdating.id)
            // new json object to replace the one in the database
            .replace(companyUpdating);

        return updatedItem;

    } catch (e) {
        return { error: "Issue occured while removing trip" };
    }
}


async function removeEquipmentFromCompany(licensePlate, contactEmail) {

    // query to return all items
    const companyUpdating = await this.getCompanyByContactEmail(contactEmail);
    
    ownedEquipment = companyUpdating.ownedEquipment;

    for(var i in ownedEquipment){
        if(ownedEquipment[i].licensePlate === licensePlate){
            ownedEquipment[i].active = false;
        }
    }

    companyUpdating.ownedEquipment = ownedEquipment;

    // read all items in the Items container
    const { resources: updatedItem } = await companyContainer
        .item(companyUpdating.id, companyUpdating.id)
        // new json object to replace the one in the database
        .replace(companyUpdating);

    return updatedItem;
}

async function updateDashboardConfig(config, companyEmail) {
    try {
        if (config == null || companyEmail == null) {
            throw new Error("Unable to verify permissions.")
        }

        const companyUpdating = await this.getCompanyByContactEmail(companyEmail);

        companyUpdating.dashboardConfig = config;

        const { resources: updatedItem } = await companyContainer
            .item(companyUpdating.id, companyUpdating.companyEmail)
            // new json object to replace the one in the database
            .replace(companyUpdating);

        // console.log(items);
        return companyUpdating.dashboardConfig;
    } catch (err) {
        // console.log(err);
        return { error: err };
    }
}

async function getDashboardConfig(companyEmail) {
    try {
        const querySpec = {
            query: "SELECT c.dashboardConfig FROM Company c WHERE c.contactEmail = '" + companyEmail + "'"
        };

        const { resources: items } = await companyContainer.items.query(querySpec).fetchAll();

        return items[0].dashboardConfig;
    } catch (err) {
        // console.log(err);
        return { error: err };
    }
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
            query: "SELECT c.id, c.companyName, c.contactEmail, c.companyAddress, c.employees, c.ownedEquipment, c.dashboardConfig FROM Company c Join e in c.employees Where e.email = '" + userEmail + "'"
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
            .item(items[0].id, items[0].id)
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
            query: "SELECT c.id, c.companyName, c.contactEmail, c.companyAddress, c.employees, c.ownedEquipment, c.dashboardConfig FROM Company c Join e in c.employees Where e.email = '" + userEmail + "'"
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
            .item(items[0].id, items[0].id)
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
            query: "SELECT c.id, c.companyName, c.contactEmail, c.companyAddress, c.employees, c.ownedEquipment, c.dashboardConfig FROM Company c Where c.contactEmail = '" + contactEmail + "'"
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

        await companyContainer.item(items[0].id, items[0].id).delete();

        return { success: items[0].companyName + " has been deleted" };
    } catch (e) {
        return { error: "Error occured while deleting company" };
    }

}

async function deleteEquipment(equipmentId) {
    try {
        // query for company 
        const querySpec = {
            query: "SELECT e.id, e.equipmentId, e.productName FROM Equipment e WHERE e.equipmentId = '" + equipmentId + "'"
        };

        // read all items in the Items container
        const { resources: items } = await equipmentContainer.items
            .query(querySpec)
            .fetchAll();

        /**
     * Delete item
     * Pass the id and partition key value to delete the item
     */

        if (items.length <= 0) {
            return { error: "No equipment found " };
        }

        const { resource: result } = await equipmentContainer.item(items[0].id, items[0].equipmentId).delete();

        return { success: items[0].productName + " has been deleted" };
    } catch (e) {
        return { error: "Error occured while deleting equipment" };
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


module.exports = { getCompanyData, getCompanyByContactEmail, getAssociatedCompanies, getEquipmentData, getTestData, createNewCompany, /* createNewEquipment, */ getVehicleData, getFilteredVehicles, addEmployeeToCompany, isEmployeeAdmin, giveAdminPriviledge, takeAdminPriviledge, addEquipmentToCompany, removeEquipmentFromCompany, removeEmployeeFromCompany, deleteCompany, /* deleteEquipment, */ addTripToVehicle, getTripsForCompany, removeTripFromCompany, getEmissionsPerVehicle, getTripData, updateDashboardConfig, getDashboardConfig, updateCompanyAddress, updateCompanyName, updateCompanyEmail, getCompanyTimeStamp }; // Add any new database access functions to the export or they won't be usable


