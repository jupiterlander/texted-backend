# Backend for [editor-frontend](https://github.com/jupiterlander/texted-frontend)
An express-backend-api for an assignment in the course jsramverk.se at [BTH](https://www.bth.se/)

[![Build Status](https://app.travis-ci.com/jupiterlander/texted-backend.svg?branch=main)](https://app.travis-ci.com/jupiterlander/texted-backend)

## How to install

```
$ git clone git@github.com:jupiterlander/texted-backend.git
```

Edit the local and production config files to fit the databases(or setup an mongodb locally and run in your local environment for developent)
```
$ nano database/config.local.js
```
```
const url = 'mongodb://localhost:27017';// <- use default or edit
const dbName = 'texteditor';            // <- use default or edit
const collectionName = 'documents';     // <- use default or edit

module.exports = { url, dbName, collectionName };

```

The config.production.js file and config.test.js files for the database uses the env-variables: `DB_USER` and `DB_SECRET`, 
and they are set at Travis-CI for testing and at the mongodb atlas cloud for production.

## Start
Start app with production config(be aware that you're working against your production database!):
```
$ npm run start
```
Or start(with nodemon) for local development:
```
$ npm run dev-start
```

## Test
Test is performed against a test database at the same location as the production DB, with 
the tools: mocha, chai, istanbul. 
```
$ npm run test
```


## Routing

Routes are stored in single files in the routes folder

Example:
```
/routes/all.js
```
````
...

router.get('/all', async function(req, res, next) {
    const result = await database.all();
    console.log(result);

    const data = {
        data: {
            msg:result
        }
    };

    res.json(data);
});

module.exports = router;
````

And imported and "mounted" in app.js
```
...

//routes
const index = require('./routes/index');
const all = require('./routes/all');

...

// setup routes

app.use('/', index);
app.use('/docs', all);


```