const firebaseAdmin = require('firebase-admin');
const defaultAuth = firebaseAdmin.auth()
const db = require('../access-db');

module.exports = function (app) {
    app.get('/test', (req, res) => {
        res.json({ test: "SUCCESSED" });
    })

    app.post('/testVerify', (req, res) => {
        // console.log(req);
        defaultAuth.verifyIdToken(req.body.token)
            .then((decodedToken) => {
                // const uid = decodedToken.uid;
                res.json({ accountVerify: "SUCCESSED" });
            })
            .catch((error) => {
                // Handle error
                console.log(error)
                res.json({ accountVerify: "BAD TOKEN" });
            });
    })

    app.post('/testDatabase', async (req, res) => {
        //response type
        res.contentType('application/json');

        //change this to info from the db
        // console.log(await db.getTestData());
        var items = Object.assign({}, await db.getTestData()); // combine the result with an empty object to ensure items is not undefined
        var size = Object.keys(items).length // get the number of keys in the object

        //send the response
        if (size > 0) {
            res.json(items);
        } else {
            res.json({})
        }
    })
}