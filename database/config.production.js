const user = process.env.DB_USER
const secret = process.env.DB_SECRET

const url = `mongodb+srv://${user}:${secret}@cluster0.a67az.mongodb.net/texteditor?retryWrites=true&w=majority`;
const dbName = 'texteditor';
const collectionName = 'documents';

module.exports = { url, dbName, collectionName };