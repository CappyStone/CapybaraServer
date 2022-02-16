module.exports = function (app) {
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
}