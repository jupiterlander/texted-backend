const express = require('express');
const router = express.Router();


router.post('/store', async function(req, res) {
    console.log(req.user.username, req.body);
    const result = await req.app.get('db').insertDoc(req.user.username, req.body.document);

    if (!result.id) {
        const data = {
            msg: `Failed saving doc with id: ${result.id} for user: ${req.user.username}`,
        };

        return res.status(500).json(data);
    }

    const data = {
        msg: `Saved doc with id: ${result.id} for user: ${req.user.username}`,
        id: result.id
    };

    return res.status(201).json(data);
});

module.exports = router;
