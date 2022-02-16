const db = require('../access-db');

module.exports = function (app) {
    app.get('/getCompanyData', async (req, res) => {
        //api URI is http://localhost:3001/getCompanyData?userEmail=ENTERUSEREMAILHERE
        const userEmail = req.query.userEmail;

        //response type
        res.contentType('application/json');

        //change this to info from the db
        var items = await db.getCompanyData(userEmail);

        //send the response
        res.json(items);
    })

    app.get('/getEquipmentData', async (req, res) => {
        //api URI is http://localhost:3001/getEquipmentId?equipmentId=ENTERID
        const equipmentId = req.query.equipmentId;
        //response type
        res.contentType('application/json');

        //change this to info from the db
        var items = await db.getEquipmentData(equipmentId);

        //send the response
        res.json(items);
    })
}