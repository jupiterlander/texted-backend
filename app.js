//express
const express = require('express');

//routes
const userAllDocs = require('./routes/all');
const userStoreDoc = require('./routes/store');
const userAllAccess = require('./routes/access');

const findDoc = require('./routes/find');
const updateUserDoc = require('./routes/update');
const signup = require('./routes/signup');
const login = require('./routes/login');
const loggedin = require('./routes/loggedin');


//cors
const cors = require("cors"); //cors for x-scripting security

//sockets
const http = require('http');
const NodeCache = require( "node-cache" );

//auth
const jwtAuth = require('./auth/middleware/jwtAuth');

//db
const db = require('./database/dbHandler');


//Webserver & port
const port = process.env.PORT || 1337;
const webserver = process.env.NODE_ENV === "production"?
    "http://www.student.bth.se":
    "http://localhost:3000";


console.log("webserv: ", webserver);

//express
const app = express();


app.use(express.urlencoded({
    extended: true
}));

app.use(cors({origin: webserver, credentials: true}));

//db
db.initConnection();
app.set('db', db);


//sockets
const httpServer = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(httpServer,
    {
        cors: {
            origin: webserver,
            methods: ["GET", "POST"]
        },
    });

const socketCache = new NodeCache();


//Logging
const morgan = require("morgan");

// don't show the log when it is test
// use morgan to log at command line
// 'combined' outputs the Apache style LOGs
//process.env.NODE_ENV !== 'test'? app.use(morgan('combined')): null;
app.use(morgan('combined'));

app.use(express.json());



//Check if token is in req and verify
app.use(jwtAuth.checkToken);

app.get('/loggedin', loggedin);
app.post('/signup', signup);
app.post("/login", login);

app.get("/logout", function (req, res) {
    res.status(304).redirect('/');
});
app.get("/failure", (req, res)=>{console.log("failure"); res.status(304).json({"msg": "error"});});



// **********************************************
//Auth for incoming requests
//checks if jwt is verified ie. req.user exists
const checkAuthentication = (req, res, next) => {
    if (req?.user || req._socketio) {
        next();
    } else {
        console.log("from checkauth 114");
        res.status(403).json({"msg": "forbidden from checkauth 114"});
    }
};

app.use('/socket.io', (req, res, next) => {
    req._socketio = true; console.log("/socket.io route - no auth"); next();
});
app.use(checkAuthentication);


// ***********************************************
// For all routes below user needs to be logged in
// ***********************************************

app.use('/docs', userAllDocs);
app.use('/docs', userStoreDoc);
app.use('/docs', updateUserDoc);
app.use('/docs', userAllAccess);
app.use('/docs', findDoc);


// ******************************
// socket.io section
// ******************************

// tmpDoc holds all doc-room's documents, to emit when new 'user' is connected.
// need to store in db. Later fix.
// let tmpDoc = {};
// now socketCache


// wrap for socket middleware
// const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use((socket, next)=>{
    const token = socket.handshake.auth.token;
    const result = jwtAuth.verifyToken(token);

    if (result.err) {
        console.log("authFailed");
        socket.emit("authFailed"); // optional.
        socket.disconnect(); // disconnect client
        console.log("in socket: not auth!", );
    }
    socket.request.user = result.user;
    next();
});

io.sockets.on("connection", function (socket) {
    console.log("Connected: ", socket.request.user, socket.id);

    const user = socket.request.user;

    socket.data.user = user;

    socket.on("join", async room => {
        const doc = (await db.getAllUsernamesWithAccess(user.username, room.id))[0];
        const accessUsers = doc.docs.access;
        const owner = doc.profile.username;

        // check if user has access to room/document - id
        if (user.username === owner || accessUsers.includes(user.username)) {
            console.log(`${user.username} joined room.id!`);
            socket.join(room.id);

            if (socketCache.get(room.id)) {
                io.to(room.id).emit("doc", {"value": socketCache.get(room.id).value});
            } else {
                const docdata = await db.getDoc(null, room.id);

                io.to(room.id).emit("doc", {"value": docdata.docs[0]['docdata']});
            }

            //if joined then can recieve doc
            socket.on("doc", doc => {
                socketCache.set(doc.id, { "owner": user.username, "value": doc.value });
                socket.to(doc.id).emit("doc", doc);
            });

            socket.to(room.id).emit("joined");
        }
    });

    socket.on("removeaccess", async (username, roomId)=> {
        const sockets = await io.in(roomId).fetchSockets();
        const leavingsocket = sockets.find(socket => socket.data.user.username === username);

        leavingsocket.leave(roomId);
        io.to(leavingsocket.id).emit("accessremoved");
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
