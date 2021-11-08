// const express = require("express");
// const app = express();

// const httpServer = require("http").createServer(app);

// const io = require("socket.io")(httpServer);

// env:s
const port = process.env.PORT || 1337;

//express
const express = require('express');
const app = express();
const session = require('express-session');
const sessionMiddleware = session({
    secret: 'kaffekopp',
    resave: false,
    saveUninitialized: false,
});
const bodyParser = require('body-parser');
const cors = require("cors"); //cors for x-scripting security

app.use(cors({origin: true, credentials: true}));


//sockets
const http = require('http');
const httpServer = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(httpServer,   {cors: {
    origin: true,
    credentials: true,
}
});
const NodeCache = require( "node-cache" );
const socketCache = new NodeCache();

//auth
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const githubConfig = require('./auth/passport-github.config');

const db = require('./database/dbHandler');

const passportinitMiddleware = passport.initialize();
const passportSessionMiddleware = passport.session();

app.use(express.urlencoded({
    extended: true
}));
app.use(sessionMiddleware);
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(passportinitMiddleware);
app.use(passportSessionMiddleware);

console.log("passportsessionid: ", passportSessionMiddleware.id);


passport.serializeUser(function (user, done) {
    console.log("serur:", user);
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    console.log("desur:", user);
    done(null, user);
});


//Logging
const morgan = require("morgan");

// don't show the log when it is test
// use morgan to log at command line
// 'combined' outputs the Apache style LOGs
//process.env.NODE_ENV !== 'test'? app.use(morgan('combined')): null;
app.use(morgan('combined'));

app.use(express.json());


//routes
//const index = require('./routes/index');
const all = require('./routes/all');
const store = require('./routes/store');
const find = require('./routes/find');
const last = require('./routes/last');
const update = require('./routes/update');
const signup = require('./routes/signup');
const access = require('./routes/access');
const exp = require('constants');
const { Passport, authenticate } = require('passport');




//app.use('*', (req,res, done)=>{console.log("res.user;", res.user); /* console.log("req.session + req.user", req.session, req.user); */ done();});

// passport.use(
//     new GitHubStrategy(
//         githubConfig,
//         function (accessToken, refreshToken, profile, done) {
//             console.log(profile.username);
//             return done(null, profile);
//             /* User.findOrCreate({githubId: profile.id}, function (err, user) {
//                 return done(err, user);
//             }); */
//         },
//     ),
// );

passport.use(
    new LocalStrategy(async function (username, password, done) {
        const user = (await db.getUser(username));
        console.log("username", username, "pwd", password, "doen", done, "user.profile", user?.profile);
;
        if (!user) {
            return done(null, false, "Username not found!");
        }
        if (user.profile.password !== password) {
            return done(null, false, "Password incorrect!");
        }
        // if (!user.verifyPassword(password)) {
        //     return done(null, false);
        // }

        user.profile.password = null;
        console.log("pwd ok");
        return done(null, user.profile);
    }),
);

// setup routes
// app.get('/', (req, res)=>{
//     if (req.session.views) {
//         req.session.views++;
//     }else {
//         req.session.views = 1;
//     }

//     console.log("req: ", req.session);
//         console.log("\n*****************\nres: ", res.locals);
//     res.json(req.session.user);
// });


app.get('/loggedin', (req, res)=>res.json({"user": req.user}));

app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/auth/github',
    passport.authenticate('github', { scope: [ 'user:email' ] })
);

app.get(
    "/auth/github/callback",
    passport.authenticate("github", {failureRedirect: "/login"}),
    function (req, res) {
        // Successful authentication, redirect home.
        console.log("req: ", req);
        console.log("\n*****************\nres: ", res);
        res.redirect("/");
    },
);



app.post('/signup', signup);

// app.post('/login', passport.authenticate('local',
//     { successRedirect: '/docs/all', failureRedirect: '/' }));

// app.post("/login", passport.authenticate("local"), function (req, res) {
//     // If this function gets called, authentication was successful.
//     // `req.user` contains the authenticated user.
//     console.log("before res.json", req.session);
//     res.json(req.user);
// });

app.post("/login", function (req, res, next) {
    //checks if already loggedin with session
    if (req.isAuthenticated()) {
        return res.json({user: req.user});
    }

    passport.authenticate("local", function (err, user, info) {
        console.log("err", err);
        console.log("user", user);
        console.log("info", info);
        console.log("req.session;", req.session);
        if (err) {
            return res.status(500).json({user: req.user});
            //return next(err);
        }
        if (!user) {
            console.log("!user");
            return res.status(404).json({"msg": info});
            //return res.redirect("/login");
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            console.log("req.session after req.login;", req.session);
            console.log("sessionid", req.sessionID);
            return res.json({user: req.user});
        });
    })(req, res, next);
});


app.get("/failure", (req, res)=>{console.log("failure"); res.status(304).json({"msg": "error"});});

// **********************************************

//Auth for incoming requests
//Checks if session from cookie has a user.
//https://github.com/jaredhanson/passport/blob/
//a892b9dc54dce34b7170ad5d73d8ccfba87f4fcf/lib/passport/http/request.js#L74
const checkAuthentication = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(403).json({"msg": "forbidden"});
    }
};

app.use(checkAuthentication);

// For all routes below user needs to be logged in
// ***********************************************
app.get("/logout", function (req, res) {
    console.log("logged out:", req.session.id);
    console.log(req.session, req.user);
    req.logout();
    console.log(req.session, req.user);

    res.clearCookie('connect.sid', {
        path: '/',
    });
    req.session.destroy(function(err) {
        res.status(200).json({'msg': 'user logged out'});
    });
});



//app.use('/', index);
// app.use('/:username/docs', alldocs);
app.use('/docs', all);
app.use('/docs', store);
app.use('/docs', find);
app.use('/:username/docs', last);
app.use('/docs', update);
app.use('/docs', access);


// ******************************
// socket.io section
// ******************************

// tmpDoc holds all doc-room's documents, to emit when new 'user' is connected.
// need to store in db. Later fix.
let tmpDoc = {};
// now socketCache


// wrap for socket middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

// authorize socket connection if authenticated
io.use((socket, next) => {
    if (!socket.request.isAuthenticated()) {
        socket.emit("authFailed"); // optional.
        socket.disconnect(); // disconnect client
        console.log("in socket: not auth!");
    } else {
        console.log("in socket: next!");
        next();
    }
});

io.sockets.on("connection", function (socket) {
    console.log("Connected: ", socket.id);
    console.log("socket-session", socket.request.session);
    console.log("sessionid", socket.request.sessionID);

    //let currentroom = null;
    const user = socket.request.session.passport.user;

    const session = socket.request.session;

    console.log(`saving sid ${socket.id} in session ${session.id}`);
    session.socketId = socket.id;
    session.document = '';
    session.save();

    socket.on("join", async room => {
        console.log("db.access - username; ", user.username, "\nroom: ", room, "\ndb.getAccess: ");
        const doc = (await db.getAllUsernamesWithAccess(user.username, room.id))[0];
        const accessUsers = doc.docs.access;
        const owner = doc.profile.username;

        console.log("db.access - username; ", user.username, "\nroom: ", room, "\ndb.getAccess: ", accessUsers);

        // check if user has access to room/document - id
        if (user.username === owner || accessUsers.includes(user.username)) {
            console.log(`${user.username} joined room.id!`);
            socket.join(room.id);
            //currentroom = room.id;

            //if joined then can recieve doc
            socket.on("doc", doc => {
                //tmpDoc[currentroom] = doc;
                socketCache.set(doc.id, doc.value);
                socket.to(doc.id).emit("doc", doc);
                console.log("emitted", doc, "to room: ", doc.id);
            });

            socket.to(room.id).emit("joined");

            if (socketCache.get(room.id)) {
                //io.to(socket.id).emit("doc", socketCache.get(room.id));
                io.to(room.id).emit("doc", {"value": socketCache.get(room.id)});
            } else {
                const docdata = await db.getDoc(null, room.id);
                console.log(docdata, docdata.docs[0]['docdata']);
                io.to(room.id).emit("doc", {"value": docdata.docs[0]['docdata']});
            }
            console.log("****************************************");
            console.log("sessionid", socket.request.sessionID);
            console.log("user", socket.request.session?.passport?.user);
            console.log(
                socket.id,
                " joined room ",
                room.id,
                socket.handshake.headers.host,
            );
            console.log("****************************************");
        }
    });

    socket.on("leave", room => {
        console.log("socket", socket.id, "left room", room.id);
        socket.leave(room.id);
    });

    socket.on("disconnecting", socket => {
        console.log(socket.id, "disconnecting", socket.id);
        //io.in(currentroom).emit("disconnected");
        //socket.to(room.id).emit("joined");
    });
});


// Start up server
//const server = app.listen(port, () => console.log(`Express API is listening on port ${port}!`));
const socketserver = httpServer.listen(
    port,
    () => console.log(`Socketio is listening on port ${port}!`));

//module.exports = server;
module.exports = socketserver;
