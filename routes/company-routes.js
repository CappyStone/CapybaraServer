const db = require('../access-db');

module.exports = function (app) {
    app.post('/getCompanyData', async (req, res) => {
        //api URI is http://localhost:3001/getCompanyData?userEmail=ENTERUSEREMAILHERE
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

    app.post('/getEquipmentData', async (req, res) => {
        //api URI is http://localhost:3001/getEquipmentId?equipmentId=ENTERID
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