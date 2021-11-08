const express = require('express');
const router = express.Router();
const database = require('../database/dbHandler');


router.get('/find/:id', async function(req, res) {
    const result = await database.getDoc(req.user?.username, req.params.id);

    console.log("result: ", result);
    const doc = result?.docs?.shift();
    const status = doc? 200: 404;

    const data = {
        msg: '',
        doc: doc
    };

    res.status(status).json(data);
});

module.exports = router;
