const express = require("express");
const router = express.Router();
const database = require("../database/dbHandler");
const ObjectId = require('mongodb').ObjectId;

router.put("/update", async function (req, res, next) {
   
    console.log(req.body);
    const filter = {"_id": new ObjectId(req.body._id)};
    const updateDoc = {$set: {document: req.body.document}};
    
    console.log("filter: ", filter, "\/nupdatdoc: ", updateDoc);
    const result = await database.update(filter, updateDoc);
    console.log("updateresult: ", result);

    const data = {
        data: {
            msg: result,
        },
    };

    res.json(data);
});

module.exports = router;

