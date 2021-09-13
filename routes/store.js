const express = require('express');
const router = express.Router();
const database = require('../database/dbHandler');

router.post('/store', async function(req, res, next) {
   console.log(req.body);
   const result = await database.store(req.body);
    console.log(result);

    const data = {
        data: {
            msg:result
        }
    };

    res.json(data);
});

module.exports = router;