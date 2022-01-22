const express = require('express')
const app = express()
const port = process.env.port || 3001

app.get('/test', (req, res) => {
    res.json({ test: "SUCCESSED" });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})