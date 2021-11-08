const express = require('express');
const router = express.Router({mergeParams: true});
const database = require('../database/dbHandler');

const userExist = async (username) => {
    await database.userExist(username);
};


router.post("/access", async function (req, res) {
    const data = {
        msg: "",
        result: {},
        access: [],
    };
    // const user = await userExist(req.body.username);

    if (! await userExist(req.body.username)) {
        data.msg = `User ${req.body.username} doesn't exist!`;
        res.status(404).json(data);
    } else {
        data.result = await database.storeAccess(
            req.user.username,
            req.body.id,
            req.body.username,
        );

        if (data.result.modifiedCount) {
            const result = await database.getAllUsernamesWithAccess(
                req.user.username,
                req.body.id,
                req.body.username,
            );

            data.access = result[0].docs.access;
        } else {
            data.msg = "User has access!";
        }

        console.log("data to be sent:", data);

        res.json(data);
    }
});

router.delete('/access', async function(req, res) {
    const data = {
        msg: "",
        result: null,
        access: null
    };

    data.result = await database.removeAccess(req.user.username, req.body.id, req.body.username);

    if (data.result.modifiedCount) {
        const result = await database.getAllUsernamesWithAccess(
            req.user.username, req.body.id);

        data.access = result[0].docs.access;
    } else {
        data.msg = "User has not access!";
    }

    console.log(data);

    res.json(data);
});

router.get('/access/:id', async function(req, res) {
    const result = await database.getAccess(req.user.username, req.params.id);

    console.log('/access/:id', result);

    const data = {
        docs: delete result.docdata
    };

    res.json(data);
});

module.exports = router;
