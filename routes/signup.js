const express = require('express');
const router = express.Router();
const db = require('../database/dbHandler');

router.post('/signup', async function(req, res) {
    console.log("req.body", req.body);
    try {
        const result = await db.insertUser(req.body);

        res.status(201).json(result);
    } catch (e) {
        console.log("signup error: ", e);
        if (e.code === 11000) {
            res.status(403).json({msg: "User already exists!"});
        } else {
            res.status(500).json({msg: "Something went wrong..."});
        }
    }
});

module.exports = router;
