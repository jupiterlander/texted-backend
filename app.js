// const express = require("express");
// const app = express();

// const httpServer = require("http").createServer(app);

// const io = require("socket.io")(httpServer);

const express = require('express');
const app = express();
const http = require('http');
const httpServer = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(httpServer,  {cors: {
    origin: "*",
    methods: ["GET", "POST"]
}
});

const cors = require("cors");
//const morgan = require("morgan");

const port = process.env.PORT || 1337;

//routes
//const index = require('./routes/index');
const all = require('./routes/all');
const store = require('./routes/store');
const find = require('./routes/find');
const last = require('./routes/last');
const update = require('./routes/update');


//cors for x-scripting security
app.use(cors());

// don't show the log when it is test
// use morgan to log at command line
// 'combined' outputs the Apache style LOGs
//process.env.NODE_ENV !== 'test'? app.use(morgan('combined')): null;

app.use(express.json());

// setup routes

app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//app.use('/', index);
app.use('/docs', all);
app.use('/docs', store);
app.use('/docs', find);
app.use('/docs', last);
app.use('/docs', update);

// tmpDoc holds all doc-room's documents, to emit when new 'user' is connected.
let tmpDoc = {};

io.sockets.on('connection', function(socket) {
    console.log("Connected: ", socket.id);
    let currentroom = null;

    socket.on("join", async (room)=>{
        socket.join(room.id);
        currentroom = room.id;

        socket.to(currentroom).emit('joined');

        if (tmpDoc[currentroom]) {
            io.to(socket.id).emit('doc', tmpDoc[currentroom]);
        }

        console.log(socket.id, " joined room ", room.id, socket.handshake.headers.host);
    });

    socket.on("leave", (room)=>{
        console.log("socket", socket.id, "left room", room.id);
        socket.leave(room.id);
    });

    socket.on("doc", (doc)=>{
        tmpDoc[currentroom] = doc;
        socket.to(currentroom).emit('doc', doc);
        //console.log("emitted", doc, "to room: ", currentroom );
    });

    socket.on("disconnecting", () => {
        console.log(socket.id, "disconnecting", currentroom);
        io.in(currentroom).emit('disconnected');
    });
});


// Start up server
//const server = app.listen(port, () => console.log(`Express API is listening on port ${port}!`));
const socketserver = httpServer.listen(
    port,
    () => console.log(`Socketio is listening on port ${port}!`));

//module.exports = server;
module.exports = socketserver;
