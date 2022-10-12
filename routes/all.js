const express = require('express');
const router = express.Router({mergeParams: true});

router.get('/all', async function(req, res) {
    const docs = await req.app.get('db').allDocs(req.user.username);
    const access = await req.app.get('db').allAccessDocs(req.user.username);

    //console.log(docs);
    //console.log(access);
    const data = {
        docs: docs,
        access: access
    };

    res.json(data);
});

module.exports = router;
