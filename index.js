var fs = require('fs');
const express = require('express')
const cors = require('cors');
const firebaseAdmin = require('firebase-admin');

const app = express()
const port = process.env.port || 3001

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.applicationDefault(),
  projectId: "capstoneprojectcapybara"
});
var defaultAuth = firebaseAdmin.auth()

// load routes
const directory = __dirname + '/routes/'
fs.readdirSync(directory).forEach(function (file) {
  if (file === "index.js" || file.substr(file.lastIndexOf('.') + 1) !== 'js')
    return;
  var name = file.substr(0, file.indexOf('.'));
  require(directory + name)(app);
});

// CORS for local development
app.use(cors({
  origin: ['http://localhost:3000']
}));

// JSON parsing for the body
app.use(express.json())

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})