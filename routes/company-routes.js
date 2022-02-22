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

       
    })

    app.post('/createCompany', async (req, res) => {

        //parameters needed to make a new company
        const companyName = req.body.companyName;
        const companyStreet = req.body.companyStreet;
        const companyCity = req.body.companyCity;
        const companyCountry = req.body.companyCountry;
        const companyProvinceState = req.body.companyProvinceState;
        const companyPostalZipCode = req.body.companyPostalZipCode;
        const email = req.body.email;
        
        //response type
        res.contentType('application/json');

        //create a new company
        var newCompany = Object.assign({}, await db.createNewCompany(companyName, companyStreet, companyCity, companyProvinceState, companyCountry, companyPostalZipCode, email)); 
        //query for newly created company
        var items = Object.assign({}, await db.getCompanyData(email)); // combine the result with an empty object to ensure items is not undefined
        var size = Object.keys(items).length; // get the number of keys in the object
        
        //send the response
        if (size > 0) {
            res.json(items);
        } else {
            res.json({})
        }
    })

    app.post('/createNewEquipment', async (req, res) => {

        //parameters needed to make a new company
        const equipmentId = req.body.equipmentId;
        const category = req.body.category;
        const productName = req.body.productName;
        const description = req.body.description;
        const manufacturer = req.body.manufacturer;
        const serialNumber = req.body.serialNumber;
        const greenScore = req.body.greenScore;
        const efficiencyRating = req.body.efficiencyRating;
        const estimatedPrice = req.body.estimatedPrice;
        const verified = req.body.verified;
        
        //response type
        res.contentType('application/json');

        //create new equipment
        var newEquipment = Object.assign({}, await db.createNewEquipment(equipmentId, category, productName, description, manufacturer, serialNumber, greenScore, efficiencyRating, estimatedPrice, verified)); 
        //query for newly created equiment
        var items = Object.assign({}, await db.getEquipmentData(equipmentId)); // combine the result with an empty object to ensure items is not undefined
        var size = Object.keys(items).length; // get the number of keys in the object
        
        //send the response
        if (size > 0) {
            res.json(items);
        } else {
            res.json({})
        }
    })

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
}