const user = process.env.DB_USER;
const secret = process.env.DB_SECRET;

const url = `mongodb+srv://${user}:${secret}` +
            `@cluster0.a67az.mongodb.net/?retryWrites=true&w=majority`;
const dbName = 'texteditor';
const collectionName = 'users';


module.exports = { url, dbName, collectionName };
