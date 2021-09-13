# Backend for [editor-frontend](https://github.com/jupiterlander/texted-frontend)
An express-backend-api for an assignment in the course jsramverk.se at [BTH](https://www.bth.se/) 

## How to install

```
$ git clone git@github.com:jupiterlander/texted-backend.git
```

Copy config file for db and rename it to config.prod.js and 
edit the local and production config files to fit the databases(or setup an mongodb locally and run in your local environment for developent)
```
$ cp config.local.js config.prod.js
$ nano database/config.prod.js
```
```
const url = 'mongodb://localhost:27017';// <- edit
const dbName = 'mumin';                 // <- edit
const collectionName = 'crowd';         // <- edit

module.exports = { url, dbName, collectionName };

```

## Start
Start app with production config(will fallback to local config if no config.prod.js file exists)
```
$ npm run start
```
Or start(with nodemon) for local development
```
$ npm run dev-start
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