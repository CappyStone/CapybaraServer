const express = require('express')
const cors = require('cors');
const firebaseAdmin = require('firebase-admin');

const app = express()
const port = process.env.port || 3001

var defaultApp = firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.applicationDefault(),
    projectId: "capstoneprojectcapybara"
});
var defaultAuth = firebaseAdmin.auth()

// CORS for local development
app.use(cors({
    origin: ['http://localhost:3000']
}));

// JSON parsing for the body
app.use(express.json())

app.get('/test', (req, res) => {
    res.json({ test: "SUCCESSED" });
})

app.post('/testVerify', (req, res) => {
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

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
