const express = require('express');
const router = express.Router();
const database = require('../database/dbHandler');

router.get('/last', async function(req, res, next) {
    const result = await database.last();
    console.log(result);

    const data = {
        data: {
            msg:result
        }
    };

    res.json(data);
});

module.exports = router;