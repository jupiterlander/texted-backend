const express = require('express');
const router = express.Router({mergeParams: true});
const database = require('../database/dbHandler');

router.get('/all', async function(req, res) {
    console.log("req.usrr", req.user);
    const docs = await database.allDocs(req.user.username);
    const access = await database.allAccessDocs(req.user.username);

    console.log(docs);
    console.log(access);
    const data = {
        docs: docs,
        access: access
    };

    res.json(data);
});

module.exports = router;
