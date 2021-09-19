const user = process.env.DB_USER
const secret = process.env.SECRET

//const url = 'mongodb+srv://texted:8YwQlMPb5MctrL9n@cluster0.a67az.mongodb.net/texteditor?retryWrites=true&w=majority';
const url = `mongodb+srv://${user}:${secret}@cluster0.a67az.mongodb.net/texteditor?retryWrites=true&w=majority`;
const dbName = 'texteditor_test';
const collectionName = 'documents';

module.exports = { url, dbName, collectionName };

// const url = 'mongodb+srv://texted_test:e1ZpjxAiocldFc36@cluster0.a67az.mongodb.net/texteditor?retryWrites=true&w=majority';
// const dbName = 'texteditor_test';
// const collectionName = 'documents';
// const url = process.env.NODE_ENV;



// module.exports = { url, dbName, collectionName };