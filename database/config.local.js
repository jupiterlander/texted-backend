// const url = 'mongodb://localhost:27017';
// const dbName = 'texteditor';
// const collectionName = 'users';

const user = process.env.DB_USER ||'database_user';
const secret = process.env.DB_SECRET || 'database_secret';

const url = `mongodb+srv://${user}:${secret}` +
            `@cluster0.a67az.mongodb.net/?retryWrites=true&w=majority`;
const dbName = 'texteditor';
const collectionName = 'users';

module.exports = { url, dbName, collectionName };
