const express = require('express');
const router = express.Router();
const database = require('../database/dbHandler');

router.get('/all', async function(req, res, next) {
    const result = await database.all();

    const data = {
        data: {
            msg:result
        }
    };
    res.json(data);
});

module.exports = router;
