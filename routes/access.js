const express = require('express');
const router = express.Router({mergeParams: true});


router.post("/access", async function (req, res) {
    const data = {
        msg: "",
        result: {},
        access: [],
    };


    if (req.body.username === req.user.username) {
        data.msg = `User ${req.body.username} is the owner of the document!`;
        return res.status(404).json(data);
    }

    const user = await req.app.get('db').getUser(req.body.username);

    if (!user) {
        data.msg = `User ${req.body.username} doesn't exist!`;
        return res.status(404).json(data);
    }

    data.result = await req.app.get('db').storeAccess(
        req.user.username,
        req.body.id,
        req.body.username,
    );

    if (!data.result.matchedCount) {
        data.msg = "No access to document!";
        return res.status(404).json(data);
    }

    if (!data.result.modifiedCount) {
        data.msg = "User has already access!";
        return res.status(404).json(data);
    }

    const result = await req.app.get('db').getAllUsernamesWithAccess(
        req.user.username,
        req.body.id,
        req.body.username,
    );

    data.msg = `User ${req.body.username} got access!`;
    data.access = result[0].docs.access;
    return res.status(201).json(data);
});

router.delete('/access', async function(req, res) {
    const data = {
        msg: "",
        result: null,
        access: null
    };
    const userExist = await req.app.get('db').userExist(req.body.username);

    if (!userExist) {
        data.msg = `User ${req.body.username} not found!`;
        return res.status(404).json(data);
    }

    data.result = await req.app.get('db').removeAccess(
        req.user.username, req.body.id, req.body.username);

    if (!data.result.matchedCount) {
        data.msg = "No access to document!";
        return res.status(404).json(data);
    }

    if (!data.result.modifiedCount) {
        data.msg = "User has not access!";
        return res.status(404).json(data);
    }

    const result = await req.app.get('db').getAllUsernamesWithAccess(
        req.user.username, req.body.id);

    data.msg = `User ${req.body.username} access was removed from document ${req.body.id}`;
    data.access = result[0].docs.access;
    console.log(data);

    res.status(201).json(data);
});

router.get('/access/:id', async function(req, res) {
    if (!req.params.id) {
        return res.json();
    }

    const result = await req.app.get('db').getAccess(req.user.username, req.params.id);
    console.log(req.user.username, req.params.id, result);
    const data = {
        docs: result? delete result.docdata : []
    };

    res.json(data);
});

module.exports = router;
