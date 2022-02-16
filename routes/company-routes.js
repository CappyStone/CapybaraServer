const db = require('../access-db');

module.exports = function (app) {
    app.get('/getCompanyData', async (req, res) => {

        const userEmail = req.query.userEmail;

        //response type
        res.contentType('application/json');

        //change this to info from the db
        var items = await db.getCompanyData(userEmail);

        // console.log(items);

        //send the response
        res.json(items);
    })

    app.get('/getEquipmentData', async (req, res) => {
        const equipmentId = req.query.equipmentId;
        //response type
        res.contentType('application/json');

        //change this to info from the db

        var items = await db.getEquipmentData(equipmentId);

        // console.log(items);

        //send the response
        res.json(items);
    })
}