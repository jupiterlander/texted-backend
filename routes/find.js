const express = require('express');
const router = express.Router();
const database = require('../database/dbHandler');
const ObjectId = require('mongodb').ObjectId;

router.get('/find/:id', async function(req, res) {
    const objectId = new ObjectId(req.params.id);
    const result = await database.retrieve({ _id: objectId });

    console.log(result);

    const data = {
        data: {
            msg: result
        }
    };

    res.json(data);
});

module.exports = router;
