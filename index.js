const express = require('express')
const { initializeApp } = require('firebase-admin/app');

const app = express()
const port = process.env.port || 3001

const firebase = initializeApp();
const firebaseAuth = getAuth();

app.get('/test', (req, res) => {
    res.json({ test: "SUCCESSED" });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
