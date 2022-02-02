const CosmosClient = require("@azure/cosmos").CosmosClient;
const config = require("./config");
const dbContext = require("./data/databaseContext");

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

//  <DefineNewItem>
const newItem = {
    "id": "4",
    "userId": "4",
    "name": "test4",
    "isAdmin": false,
  };
  
  const newnewItem = {
    "id": "3",
    "userId": "3",
    "name": "test3",
    "isAdmin": false,
  };
  //  </DefineNewItem>
  
  async function main() {
    
    // <CreateClientObjectDatabaseContainer>
    const { endpoint, key, databaseId, containerId } = config;
  
    const client = new CosmosClient({ endpoint, key });
  
    const database = client.database(databaseId);
    const container = database.container(containerId);
  
    // Make sure Tasks database is already setup. If not, create it.
    await dbContext.create(client, databaseId, containerId);
    // </CreateClientObjectDatabaseContainer>
    
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
      
      // <CreateItem>
      /** Create new item
       * newItem is defined at the top of this file
       */
      const { resource: createdItem } = await container.items.create(newItem);
      
      console.log(`\r\nCreated new item: ${createdItem.id} - ${createdItem.name}\r\n`);
      // </CreateItem>
      
      // <UpdateItem>
      /** Update item
       * Pull the id and partition key value from the newly created item.
       * Update the isAdmin field to true.
       */
      const { id, userId } = createdItem;
  
      createdItem.isAdmin = true;
  
      const { resource: updatedItem } = await container
        .item(id, userId)
        .replace(createdItem);
  
      console.log(`Updated item: ${updatedItem.id} - ${updatedItem.name}`); 
      console.log(`Updated isAdmin to ${updatedItem.isAdmin}\r\n`);
      // </UpdateItem>
  
  
      // <UpdateItem>
      /** Update item
       * Pull the id and partition key value from the newly created item.
       * Update the isAdmin field to true.
       */
  
  
   
       const { resource: updatedItem2 } = await container
         .item("3", "3")
         .replace(newnewItem);
   
       // </UpdateItem>
  
  
      
      // <DeleteItem>    
      /**
       * Delete item
       * Pass the id and partition key value to delete the item
       */
      const { resource: result } = await container.item(id, userId).delete();
      console.log(`Deleted item with id: ${id}`);
      // </DeleteItem>  
      
    } catch (err) {
      console.log(err.message);
    }
  }
  
  main();
