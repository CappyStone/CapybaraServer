const CosmosClient = require("@azure/cosmos").CosmosClient;
//Cosmos connection for the company container
//Company database configuration
const companyConfig = {
  databaseId: "greenStormDB",
  containerId: "Company",
  partitionKey: { kind: "Hash", paths: ["/companyId"] }
};

const endpoint = process.env.CUSTOMCONNSTR_CosmosAddress;
const key = process.env.CUSTOMCONNSTR_CosmosDBString;

// <CreateClientObjectDatabaseContainer>
const { databaseId, containerId } = companyConfig;

const client = new CosmosClient({ endpoint, key });
console.log(client);
const database = client.database(databaseId);
const container = database.container(containerId);

//Equipment database configuration
const equipmentConfig = {
  databaseId: "greenStormDB",
  containerId: "Equipment",
  partitionKey: { kind: "Hash", paths: ["/equipmentId"] }
};

// <CreateClientObjectDatabaseContainer>
const { equipmentDatabaseId, equipmentContainerId } = equipmentConfig;

const equipmentClient = new CosmosClient({ endpoint, key });
console.log(equipmentClient);
const equipmentDatabase = equipmentClient.database(equipmentDatabaseId);
const equipmentContainer = equipmentDatabase.container(equipmentContainerId);

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

async function getCompanyData(userEmail) {
  console.log(`Querying container: Items`);

  // query to return all items
  const querySpec = {
    query: "SELECT c.id, c.companyName, c.employees, c.contactEmail, c.ownedEquipment FROM Company c Join e in c.employees Where e.email = '" + userEmail + "'"
  };

  // read all items in the Items container
  const { resources: items } = await container.items
    .query(querySpec)
    .fetchAll();


  return items[0];

  //api URI is http://localhost:3001/getCompanyData?userEmail=ENTERUSEREMAILHERE
}

app.get('/getCompanyData', async (req, res) => {

  const userEmail = req.query.userEmail;

  //response type

  res.contentType('application/json');



  //change this to info from the db

  var items = await getCompanyData(userEmail);



  console.log(items);

  //send the response

  res.json(items);

})

async function getEquipmentData() {
  console.log("Querying container: Equipment");

  // query to return all items
  const querySpec = {
    query: "SELECT e.productName, e.greenScore, e.estimatedPrice, e.description FROM Equipment e WHERE e.equipmentId = 1"
  };

  // read all items in the Items container
  const { resources: items } = await equipmentContainer.items
    .query(querySpec)
    .fetchAll();


  return items[0];

  //api URI is http://localhost:3001/getCompanyData?userEmail=ENTERUSEREMAILHERE
}

app.get('/getEquipmentData', async (req, res) => {
  //const userEmail = req.query.userEmail;
  //response type
  res.contentType('application/json');

  //change this to info from the db

  var items = await getEquipmentData();

  console.log(items);
  //send the response
  res.json(items);
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



//Variable for updating/replacing existing item in container
const newItemValue = {
  "id": "3",
  "userId": "3",
  "name": "test3",
  "isAdmin": true,
};
//  </DefineNewItem>

async function main() {




  // try {
  //   // <QueryItems>
  //   console.log(`Querying container: Company`);

  //   // query to return all items
  //   const querySpec = {
  //     query: "SELECT * from c"
  //   };

  //   // read all items in the Items container
  //   const { resources: items } = await container.items
  //     .query(querySpec)
  //     .fetchAll();

  //   items.forEach(item => {
  //     console.log(`${item.id} - ${item.companyName}`);
  //   });
  // </QueryItems>

  // <UpdateItem>
  /** Update item
   * Pull the id and partition key value from the newly created item.
   * Update the isAdmin field to true.
   */


  // Updating preexisting item
  // await container.item("1", "1").replace(newItemValue);

  // </UpdateItem>


  // } catch (err) {
  //   console.log(err.message);
  // }
}

main();
