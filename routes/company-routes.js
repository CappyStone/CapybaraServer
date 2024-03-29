const db = require('../access-db');

module.exports = function (app) {
    app.post('/getCompanyData', async (req, res) => {
        const userEmail = req.body.userEmail;

        //response type
        res.contentType('application/json');

        //change this to info from the db
        var items = Object.assign({}, await db.getCompanyData(userEmail)); // combine the result with an empty object to ensure items is not undefined
        var size = Object.keys(items).length; // get the number of keys in the object

        //send the response
        if (size > 0) {
            res.json(items);
        } else {
            res.json({})
        }
    });

    app.post('/getCompanyByContactEmail', async (req, res) => {
        const contactEmail = req.body.contactEmail;

        //response type
        res.contentType('application/json');

        //change this to info from the db
        var items = Object.assign({}, await db.getCompanyByContactEmail(contactEmail)); // combine the result with an empty object to ensure items is not undefined
        var size = Object.keys(items).length; // get the number of keys in the object

        //send the response
        if (size > 0) {
            res.json(items);
        } else {
            res.json({})
        }
    });

    app.post('/getAssociatedCompanies', async (req, res) => {
        const userEmail = req.body.userEmail;

        //response type
        res.contentType('application/json');

        //change this to info from the db
        var items = Object.assign({}, await db.getAssociatedCompanies(userEmail)); // combine the result with an empty object to ensure items is not undefined
        var size = Object.keys(items).length; // get the number of keys in the object

        //send the response
        if (size > 0) {
            res.json(items);
        } else {
            res.json({})
        }
    });

    app.post('/addEmployeeToCompany', async (req, res) => {
        const companyEmail = req.body.companyEmail;
        const newEmployeeEmail = req.body.newEmployeeEmail;
        const isAdmin = req.body.isAdmin;
        const newEmployeeName = req.body.newEmployeeName;
        const authority = req.body.authority;

        //response type
        res.contentType('application/json');
        if ((await db.isEmployeeAdmin(authority, companyEmail)) !== true) {
            res.json({ error: "Unable to verify permissions." });
            return;
        } else {
            //change this to info from the db
            var items = Object.assign({}, await db.addEmployeeToCompany(companyEmail, newEmployeeEmail, newEmployeeName, isAdmin)); // combine the result with an empty object to ensure items is not undefined
            var size = Object.keys(items).length; // get the number of keys in the object

            //send the response
            if (size > 0) {
                res.json(items);
            } else {
                res.json({})
            }
        }
    });

    app.post('/removeEmployeeFromCompany', async (req, res) => {
        const userEmail = req.body.userEmail;
        const companyEmail = req.body.companyEmail;
        const authority = req.body.authority;

        //response type
        res.contentType('application/json');

        if ((await db.isEmployeeAdmin(authority, companyEmail)) !== true) {
            res.json({ error: "Unable to verify permissions." });
            return;
        } else {
            //change this to info from the db
            var items = Object.assign({}, await db.removeEmployeeFromCompany(userEmail)); // combine the result with an empty object to ensure items is not undefined
            var size = Object.keys(items).length; // get the number of keys in the object

            //send the response
            if (size > 0) {
                res.json(items);
            } else {
                res.json({})
            }
        }
    });

    app.post('/createCompany', async (req, res) => {

        //parameters needed to make a new company
        const companyName = req.body.companyName;
        const companyStreet = req.body.companyStreet;
        const companyCity = req.body.companyCity;
        const companyCountry = req.body.companyCountry;
        const companyProvinceState = req.body.companyProvinceState;
        const companyPostalZipCode = req.body.companyPostalZipCode;
        const companyEmail = req.body.companyEmail;
        const adminEmail = req.body.adminEmail;

        //response type
        res.contentType('application/json');

        // try to find existing company
        var newCompany = {};
        var items = Object.assign({}, await db.getCompanyByContactEmail(companyEmail)); // combine the result with an empty object to ensure items is not undefined
        if (Object.keys(items).length == 0) {
            //create a new company
            newCompany = Object.assign({}, await db.createNewCompany(companyName, companyStreet, companyCity, companyProvinceState, companyCountry, companyPostalZipCode, companyEmail, adminEmail));
        }

        //query for newly created company
        items = Object.assign({}, await db.getCompanyByContactEmail(companyEmail)); // combine the result with an empty object to ensure items is not undefined

        //send the response
        if (Object.keys(items).length > 0) {
            res.json(items);
        } else {
            res.json(newCompany);
        }
    })

    /*app.post('/updateCompanyAddress', async (req, res) => {
        const contactEmail = req.body.contactEmail;
        const newStreet = req.body.newStreet;
        const newCity = req.body.newCity;
        const newProvinceState = req.body.newProvinceState;
        const newCountry = req.body.newCountry;
        const newPostalZipcode = req.body.newPostalZipcode;

        //response type
        res.contentType('application/json');

        console.log("hey");

        // try to find existing company
        var items = Object.assign({}, await db.getCompanyByContactEmail(contactEmail)); // combine the result with an empty object to ensure items is not undefined
        console.log(items);
        if (Object.keys(items).length != 0) {
            //update company address
            console.log("working");
            var updatedCompany = Object.assign({}, await db.updateCompanyAddress(contactEmail, newStreet, newCity, newProvinceState, newCountry, newPostalZipcode));
            var size = Object.keys(items).length; // get the number of keys in the object

            console.log(updatedCompany);

            //send the response
            if (size > 0) {
                res.json(updatedCompany);
            } else {
                res.json({})
            }
        }
    });*/



    /* app.post('/createNewEquipment', async (req, res) => {
        //parameters needed to make a new company
        const category = req.body.vehicleClass;
        const productName = req.body.productName;
        const manufacturer = req.body.manufacturer;
        const efficiencyRating = req.body.combFuelConsumption;
        const estimatedPrice = req.body.price;

        //response type
        res.contentType('application/json');

        //create new equipment
        var newEquipment = Object.assign({}, await db.createNewEquipment(category, productName, description, manufacturer, serialNumber, greenScore, efficiencyRating, estimatedPrice, verified));
        //query for newly created equiment
        //var items = Object.assign({}, await db.getEquipmentData(equipmentId)); // combine the result with an empty object to ensure items is not undefined
        var size = Object.keys(newEquipment).length; // get the number of keys in the object

        //send the response
        if (size > 0) {
            res.json(newEquipment);
        } else {
            res.json({})
        }
    }) */

    app.post('/getModels', async (req, res) => {
        res.contentType('application/json');

        //change this to info from the db
        var items = Object.assign({}, await db.getVehicleData()); // combine the result with an empty object to ensure items is not undefined
        var size = Object.keys(items).length // get the number of keys in the object

        //send the response
        if (size > 0) {
            res.json(items);
        } else {
            res.json({})
        }
    });

    app.post('/getVehicleConfig', async (req, res) => {
        const year = req.body.searchYear;
        const make = req.body.searchMake;
        const model = req.body.searchModel;

        res.contentType('application/json');

        //change this to info from the db
        var items = Object.assign({}, await db.getFilteredVehicles(year, make, model)); // combine the result with an empty object to ensure items is not undefined
        var size = Object.keys(items).length // get the number of keys in the object

        //send the response
        if (size > 0) {
            res.json(items);
        } else {
            res.json({})
        }
    });

    app.post('/getEquipmentData', async (req, res) => {
        const equipmentId = req.body.equipmentId;
        //response type
        res.contentType('application/json');

        //change this to info from the db
        var items = Object.assign({}, await db.getEquipmentData(equipmentId)); // combine the result with an empty object to ensure items is not undefined
        var size = Object.keys(items).length // get the number of keys in the object

        //send the response
        if (size > 0) {
            res.json(items);
        } else {
            res.json({})
        }
    })

    app.post('/getTripData', async (req, res) => {
        const contactEmail = req.body.contactEmail;
        const licensePlate = req.body.licensePlate;
        const properties = req.body.properties;

        //response type
        res.contentType('application/json');

        //change this to info from the db
        var items = Object.assign({}, await db.getTripData(contactEmail, licensePlate, properties)); // combine the result with an empty object to ensure items is not undefined
        var size = Object.keys(items).length // get the number of keys in the object

        //send the response
        if (size > 0) {
            res.json(items);
        } else {
            res.json({})
        }
    })

    app.post('/getCompanyTimeStamp', async (req, res) => {
        const contactEmail = req.body.contactEmail;

        //response type
        res.contentType('application/json');

        //change this to info from the db
        var items = Object.assign({}, await db.getCompanyTimeStamp(contactEmail)); // combine the result with an empty object to ensure items is not undefined
        var size = Object.keys(items).length // get the number of keys in the object

        //send the response
        if (size > 0) {
            res.json(items);
        } else {
            res.json({})
        }
    })

    app.post('/addEquipmentToCompany', async (req, res) => {
        const equipmentId = req.body.equipmentId;
        const licensePlate = req.body.licensePlate;
        const companyEmail = req.body.companyEmail;
        const authority = req.body.authority;

        if ((await db.isEmployeeAdmin(authority, companyEmail)) !== true) {
            res.json({ error: "Unable to verify permissions." });
            return;
        } else {
            //response type
            res.contentType('application/json');

            //change this to info from the db
            var items = Object.assign({}, await db.addEquipmentToCompany(equipmentId, companyEmail, licensePlate)); // combine the result with an empty object to ensure items is not undefined

            //send the response
            if (items['error']) {
                res.json({ error: items['error'] });
            } else {
                res.json(items);
            }
        }
    });

    app.post('/updateCompanyName', async (req, res) => {
        const contactEmail = req.body.contactEmail;
        const newCompanyName = req.body.newCompanyName;
        const authority = req.body.authority;

        if ((await db.isEmployeeAdmin(authority, contactEmail)) !== true) {
            res.json({ error: "Unable to verify permissions." });
            return;
        } else {
            //response type
            res.contentType('application/json');

            //change this to info from the db
            var items = Object.assign({}, await db.updateCompanyName(contactEmail, newCompanyName)); // combine the result with an empty object to ensure items is not undefined

            //send the response
            if (items['error']) {
                res.json({ error: items['error'] });
            } else {
                res.json(items);
            }
        }
    });

    app.post('/updateCompanyEmail', async (req, res) => {
        const contactEmail = req.body.contactEmail;
        const newCompanyEmail = req.body.newCompanyEmail;
        const authority = req.body.authority;

        if ((await db.isEmployeeAdmin(authority, contactEmail)) !== true) {
            res.json({ error: "Unable to verify permissions." });
            return;
        } else {
            //response type
            res.contentType('application/json');

            //change this to info from the db
            var items = Object.assign({}, await db.updateCompanyEmail(contactEmail, newCompanyEmail)); // combine the result with an empty object to ensure items is not undefined

            //send the response
            if (items['error']) {
                res.json({ error: items['error'] });
            } else {
                res.json(items);
            }
        }
    });

    app.post('/updateCompanyAddress', async (req, res) => {
        const contactEmail = req.body.contactEmail;
        const newStreet = req.body.newStreet;
        const newCity = req.body.newCity;
        const newProvinceState = req.body.newProvinceState
        const newCountry = req.body.newCountry;
        const newPostalZipcode = req.body.newPostalZipcode;
        const authority = req.body.authority;

        if ((await db.isEmployeeAdmin(authority, contactEmail)) !== true) {
            res.json({ error: "Unable to verify permissions." });
            return;
        } else {
            //response type
            res.contentType('application/json');

            //change this to info from the db
            var items = Object.assign({}, await db.updateCompanyAddress(contactEmail, newStreet, newCity, newProvinceState, newCountry, newPostalZipcode)); // combine the result with an empty object to ensure items is not undefined

            //send the response
            if (items['error']) {
                res.json({ error: items['error'] });
            } else {
                res.json(items);
            }
        }
    });

    app.post('/getTripsForCompany', async (req, res) => {
        const companyEmail = req.body.companyEmail;
        const licensePlate = req.body.licensePlate;

        let items = Object.assign({}, await db.getTripsForCompany(companyEmail, licensePlate));

        if (items['error']) {
            res.json({ error: items['error'] });
        } else {
            res.json(items);
        }
    });

    app.post('/addTripToVehicle', async (req, res) => {
        const companyEmail = req.body.companyEmail;
        const licencePlate = req.body.licencePlate;
        const startAddress = req.body.startAddress;
        const endAddress = req.body.endAddress;
        const currentUser = req.body.currentUser;
        const tripDate = req.body.tripDate;

        //response type
        res.contentType('application/json');

        //change this to info from the db
        var items = Object.assign({}, await db.addTripToVehicle(companyEmail, licencePlate, currentUser, startAddress, endAddress, tripDate)); // combine the result with an empty object to ensure items is not undefined

        //send the response
        if (items['error']) {
            res.json({ error: items['error'] });
        } else {
            res.json(items);
        }
    });

    app.post('/removeTripFromCompany', async (req, res) => {
        const companyEmail = req.body.companyEmail;
        const currentUser = req.body.currentUser;
        const timestamp = req.body.timestamp;

        //response type
        res.contentType('application/json');

        //change this to info from the db
        var items = Object.assign({}, await db.removeTripFromCompany(companyEmail, currentUser, timestamp)); // combine the result with an empty object to ensure items is not undefined

        //send the response
        if (items['error']) {
            res.json({ error: items['error'] });
        } else {
            res.json(items);
        }
    });

    app.post('/removeEquipmentFromCompany', async (req, res) => {
        const licensePlate = req.body.licensePlate;
        const companyEmail = req.body.companyEmail;
        const authority = req.body.authority;

        if ((await db.isEmployeeAdmin(authority, companyEmail)) !== true) {
            res.json({ error: "Unable to verify permissions." });
            return;
        } else {
            //response type
            res.contentType('application/json');

            //change this to info from the db
            var items = Object.assign({}, await db.removeEquipmentFromCompany(licensePlate, companyEmail)); // combine the result with an empty object to ensure items is not undefined
            // var size = Object.keys(items).length; // get the number of keys in the object

            //send the response
            if (items['error']) {
                res.json({ error: items['error'] });
            } else {
                res.json(items);
            }
        }
    })

    app.post('/updateLicensePlate', async (req, res) => {
        const licensePlate = req.body.licensePlate;
        const companyEmail = req.body.companyEmail;
        const newLicensePlate = req.body.newLicensePlate;
        const authority = req.body.authority;

        if ((await db.isEmployeeAdmin(authority, companyEmail)) !== true) {
            res.json({ error: "Unable to verify permissions." });
            return;
        } else {
            //response type
            res.contentType('application/json');

            //change this to info from the db
            var items = Object.assign({}, await db.updateLicensePlate(licensePlate, companyEmail, newLicensePlate)); // combine the result with an empty object to ensure items is not undefined
            // var size = Object.keys(items).length; // get the number of keys in the object

            //send the response
            if (items['error']) {
                res.json({ error: items['error'] });
            } else {
                res.json(items);
            }
        }
    })

    app.post('/getEmissionsPerVehicle', async (req, res) => {
        const licensePlate = req.body.licensePlate;
        const companyEmail = req.body.companyEmail;

        //response type
        res.contentType('application/json');

        //change this to info from the db
        var items = Object.assign({}, await db.getEmissionsPerVehicle(companyEmail, licensePlate)); // combine the result with an empty object to ensure items is not undefined
        var size = Object.keys(items).length; // get the number of keys in the object

        //send the response
        if (items['error']) {
            res.json({ error: items['error'] });
        } else {
            res.json(items);
        }
    })

    app.post('/getCompanyVehicles', async (req, res) => {
        const companyEmail = req.body.companyEmail;

        //response type
        res.contentType('application/json');

        var items = [];
        var company = Object.assign({}, await db.getCompanyByContactEmail(companyEmail)); // combine the result with an empty object to ensure items is not undefined

        for (var i in company.ownedEquipment) {

            items.push(Object.assign({ licensePlate: company.ownedEquipment[i].licensePlate }, await db.getEquipmentData(company.ownedEquipment[i].equipmentId)));
        }

        // console.log(items);

        //send the response
        res.json(items);
    });

    app.post('/getDashboardConfig', async (req, res) => {
        const companyEmail = req.body.companyEmail;

        //response type
        res.contentType('application/json');

        //change this to info from the db
        var items = Object.assign({}, await db.getDashboardConfig(companyEmail)); // combine the result with an empty object to ensure items is not undefined
        var size = Object.keys(items).length; // get the number of keys in the object

        //send the response
        if (size > 0) {
            res.json(items);
        } else {
            res.json({})
        }
    });

    app.post('/updateDashboardConfig', async (req, res) => {
        const companyEmail = req.body.companyEmail;
        const authority = req.body.authority;
        const config = req.body.config;

        //response type
        res.contentType('application/json');

        if ((await db.isEmployeeAdmin(authority, companyEmail)) !== true) {
            res.json({ error: "Unable to verify permissions." });
            return;
        } else {
            //change this to info from the db
            var items = Object.assign({}, await db.updateDashboardConfig(config, companyEmail)); // combine the result with an empty object to ensure items is not undefined
            var size = Object.keys(items).length; // get the number of keys in the object

            //send the response
            if (size > 0) {
                res.json(items);
            } else {
                res.json({})
            }
        }
    });

    app.post('/isEmployeeAdmin', async (req, res) => {
        const userEmail = req.body.userEmail;
        const companyEmail = req.body.companyEmail;

        //response type
        res.contentType('application/json');

        //change this to info from the db
        var result = await db.isEmployeeAdmin(userEmail, companyEmail);
        if (!result['error']) {
            var items = Object.assign({}, { isAdmin: result }); // combine the result with an empty object to ensure items is not undefined
            var size = Object.keys(items).length; // get the number of keys in the object

            //send the response
            if (size > 0) {
                res.json(items);
            } else {
                res.json({})
            }
        } else {
            res.json({ error: "Unable to verify permissions." })
        }
    })


    app.post('/giveAdminPriviledge', async (req, res) => {
        const userEmail = req.body.userEmail;

        //response type
        res.contentType('application/json');

        //change this to info from the db
        var items = Object.assign({}, await db.giveAdminPriviledge(userEmail)); // combine the result with an empty object to ensure items is not undefined
        var size = Object.keys(items).length; // get the number of keys in the object

        //send the response
        if (size > 0) {
            res.json(items);
        } else {
            res.json({})
        }


    })

    app.post('/takeAdminPriviledge', async (req, res) => {
        const userEmail = req.body.userEmail;

        //response type
        res.contentType('application/json');

        //change this to info from the db
        var items = Object.assign({}, await db.takeAdminPriviledge(userEmail)); // combine the result with an empty object to ensure items is not undefined
        var size = Object.keys(items).length; // get the number of keys in the object

        //send the response
        if (size > 0) {
            res.json(items);
        } else {
            res.json({})
        }


    })

    app.post('/deleteCompany', async (req, res) => {

        //parameters needed to delete a company

        const companyEmail = req.body.contactEmail;


        //response type
        res.contentType('application/json');

        var items = Object.assign({}, await db.deleteCompany(companyEmail));

        //send the response
        if (Object.keys(items).length > 0) {
            res.json(items);
        } else {
            res.json({})
        }
    })

    app.post('/deleteEquipment', async (req, res) => {

        //parameters needed to delete a company

        const equipmentId = req.body.equipmentId;

        //response type
        res.contentType('application/json');

        var items = Object.assign({}, await db.deleteEquipment(equipmentId));

        //send the response
        if (Object.keys(items).length > 0) {
            res.json(items);
        } else {
            res.json({})
        }
    })
}