const express = require("express");
const router = express.Router();
const database = require("../database/dbHandler");
const ObjectId = require('mongodb').ObjectId;

router.put("/update", async function (req, res, next) {
    const filter = {"_id": new ObjectId(req.body._id)};
    const updateDoc = {$set: {document: req.body.document}};
    const result = await database.update(filter, updateDoc);
    const data = {
        data: {
            msg: result,
        },
    };

    res.json(data);
});

module.exports = router;

