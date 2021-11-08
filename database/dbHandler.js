const { url, dbName, collectionName } = require(`./config.${process.env.NODE_ENV}`);
const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient(url);
const onExit = require('signal-exit');

function toLowerKeys(obj) {
    return Object.assign(...Object.keys(obj).map(key=>({[key.toLowerCase()]: obj[key]})));
}


async function initConnection() {
    await client.connect();
}

async function closeConnection() {
    await client.close();
}

onExit((code, signal) => {
    console.log('Exiting and closing db connection...', code, signal);
    closeConnection();
});

console.log(url, dbName, collectionName);

async function connect(collectionAction) {
    let result = null;

    try {
        const collection = client.db(dbName).collection(collectionName);

        result = await collectionAction(collection);
    } catch (e) {
        console.log(e);
        throw e;
    } finally {
        //client.close();
        // done when process node process ends
    }

    return result;
}

async function all() {
    return await connect((collection) => collection.find({}).toArray());
}

async function allDocs(username) {
    return await connect(
        collection => collection.findOne(
            {'profile.username': username},
            {'projection': {'_id': false, 'docs': true}}));
}

async function allAccessDocs(username) {
    return await connect(
        collection => collection.aggregate([
            { $unwind: '$docs' },
            { $unwind: "$docs.access" },
            { $match: { 'docs.access': username } },
            { $project: { '_id': false, 'profile.username': true, 'docs.id': true } }]).toArray());
}

async function store(data) {
    return await connect((collection) => collection.insertOne(data));
}

async function insertUser(data) {
    console.log(data);
    return await connect((collection) => collection.insertOne({'profile': data}));
}

async function insertDoc(username, document) {
    const id = new ObjectId();
    const result =  await connect((collection) => collection.updateOne(
        {'profile.username': username},
        { $push: { 'docs':
            {
                'docdata':  document,
                'id': id
            }}}));

    return {...result, id: result.modifiedCount? id: null};
}

async function updateDoc(username, docid, document) {
    return await connect(
        collection => collection.updateOne(
            {'profile.username': username, 'docs.id': ObjectId(docid)},
            {$set: {'docs.$.docdata': document}}));
}

async function getUser(username) {
    return await connect(
        collection => collection.findOne({'profile.username': username},
            {'projection': {'docs': false}})
    );
}

async function userExist(username) {
    return await connect(
        collection => collection.find({'profile.username': username}).limit(1).count());
}

async function getDoc(username, docId) {
    return await connect(
        collection => collection.findOne(
            {
                /* 'profile.username': username, */
                'docs.id': ObjectId(docId)
            },
            {projection:
                {
                    '_id': false,
                    'profile.username': true,
                    'docs.$': true,
                }}
        ));
}

async function getAccess(username, docId) {
    return await connect(
        collection => collection.findOne(
            {'profile.username': username, 'docs': {$elemMatch: {id:  new ObjectId(docId)}}},
            {projection: {'docs.$': true}}
        ));
}

async function getAllUsernamesWithAccess(username, docId) {
    return await connect(
        collection => collection.aggregate([
            /* {'$match': {'profile.username': username}}, */
            {$unwind: '$docs'},
            {'$match': {'docs.id': ObjectId(docId)}},
            {$project:
                {'_id': false, 'profile.username': true, 'docs.id': true, 'docs.access': true}}
        ]).toArray());
}

async function storeAccess(username, docId, accessname) {
    return await connect(
        collection => collection.updateOne(
            {
                'profile.username': username,
                'docs': {$elemMatch: {id: ObjectId(docId)}}},
            { $addToSet:
                {  'docs.$.access': accessname } },

        ));
}

async function removeAccess(username, docId, accessname) {
    return await connect(
        collection => collection.updateOne(
            {
                'profile.username': username,
                'docs.id': ObjectId(docId)
            },
            { $pull: { 'docs.$.access': accessname }}));
}

// async function storeAccess(username, docId, accessname) {
//     return await connect(
//         collection => collection.updateOne(
//             {
//                 'profile.username': username
//             },

//             { $addToSet:
//                 {  'docs.$.access': accessname }
//             },
//             {
//                 arrayFilters: [
                    
//                 ]
//             },
//             { 'docs': {$elemMatch: {id:  new ObjectId(docId)}}
//             },

//         ));
// }

async function last() {
    return await connect((collection) => collection.find({}).sort({_id: -1}).limit(1).toArray());
}

async function remove(data={}) {
    return await connect((collection) => collection.deleteMany(data));
}

async function allDatabases() {
    // Use connect method to connect to the server
    try {
        await client.connect();
        const findResult = await client.db().admin().listDatabases();

        client.close();
        return findResult;
    } catch (e) {
        console.log(e);
    }
}


initConnection();

module.exports = {
    all, allDocs, insertUser, getUser, userExist, store, getDoc, last,
    allDatabases, updateDoc, remove, connect, insertDoc,
    storeAccess, removeAccess, getAccess, allAccessDocs, getAllUsernamesWithAccess
};
