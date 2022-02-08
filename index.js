const CosmosClient = require("@azure/cosmos").CosmosClient;
//const config = require("./config");
const config = {
  databaseId: "stormTest",
  containerId: "UserTest",
  partitionKey: { kind: "Hash", paths: ["/userId"] }
};

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


const endpoint = process.env.CUSTOMCONNSTR_CosmosAddress;
const key = process.env.CUSTOMCONNSTR_CosmosDBString;
//Variable for updating/replacing existing item in container
const newItemValue = {
  "id": "3",
  "userId": "3",
  "name": "test3",
  "isAdmin": true,
};
//  </DefineNewItem>

async function main() {

  // <CreateClientObjectDatabaseContainer>
  const { databaseId, containerId } = config;

  const client = new CosmosClient({ endpoint, key });
  console.log(client);
  const database = client.database(databaseId);
  const container = database.container(containerId);


  try {
    // <QueryItems>
    console.log(`Querying container: UserTest`);

    // query to return all items
    const querySpec = {
      query: "SELECT * from c"
    };

    // read all items in the Items container
    const { resources: items } = await container.items
      .query(querySpec)
      .fetchAll();

    items.forEach(item => {
      console.log(`${item.id} - ${item.name}`);
    });
    // </QueryItems>

    // <UpdateItem>
    /** Update item
     * Pull the id and partition key value from the newly created item.
     * Update the isAdmin field to true.
     */


    // Updating preexisting item
    await container.item("3", "3").replace(newItemValue);

    // </UpdateItem>


  } catch (err) {
    console.log(err.message);
  }
}

main();
