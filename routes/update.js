const express = require("express");
const router = express.Router();


router.put("/update", async function (req, res) {
    console.log('req.body', req.body);
    const result = await req.app.get('db').updateDoc(
        req.user.username, req.body.id, req.body.document);
    const data = {
        data: {
            msg: result,
        },
    };

    res.json(data);
});

module.exports = router;

