const express = require('express');
const router = express.Router();
const database = require('../database/dbHandler');

router.post('/store', async function(req, res) {
    console.log(req.user.username, req.body);
    const result = await database.insertDoc(req.user.username, req.body.document);
    const data = {
        data: {
            msg: result
        }
    };

    res.json(data);
});

module.exports = router;
