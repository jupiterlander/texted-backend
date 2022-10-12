const express = require('express');
const router = express.Router();


router.get('/find/:id', async function(req, res) {
    if (!req.params.id) {
        const data = {
            msg: `No document id in request!`,
            doc: null
        };

        return res.status(404).json(data);
    }
    console.log(req.user.username, req.params.id);
    const result = await req.app.get('db').getDoc(req.user.username, req.params.id);
    const doc = result?.docs[0];

    if (!result) {
        const data = {
            msg: `Document ${req.params.id} not found!`,
            doc: null
        };

        return res.status(404).json(data);
    }

    if (doc.access?.includes(req.user.username) || req.user.username === result.profile.username) {
        delete result.docs;//Fix the return values

        const data = {
            msg: '',
            doc: doc
        };

        return res.status(200).json(data);
    }

    const data = {
        msg: `User ${req.user.username} has not access to the document ${req.params.id}!`,
        doc: null
    };

    return res.status(403).json(data);
});

module.exports = router;
