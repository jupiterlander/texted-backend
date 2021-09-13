const { url, dbName, collectionName } = require(process.env.NODE_ENV === 'production'? './config.prod': './config.local');
const { MongoClient } = require('mongodb');
const client = new MongoClient(url);


async function connect(collectionAction) {
    let result = null;

    try {
        await client.connect();
        const collection = client.db(dbName).collection(collectionName);

        result = await collectionAction(collection);
    } catch (e) {
        console.log(e);
    } finally {
        client.close();
    }

    return result;
}

async function all() {
    return await connect((collection) => collection.find({}).toArray());
}

async function store(data) {
    return await connect((collection) => collection.insertOne(data));
}

async function update(filter, document) {
    return await connect((collection) => collection.updateOne(filter, document));
}

async function retrieve(data) {
    return await connect((collection) => collection.findOne(data));
}

async function last() {
    return await connect((collection) => collection.find({}).sort({_id:-1}).limit(1).toArray());
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

module.exports = { all, store, retrieve, last, allDatabases, update }; 
