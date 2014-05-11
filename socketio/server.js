var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);


// Change SocketIO's default resource to ``/char``.
io.set('resource', '/chat');


// Serve static file via express's middleware.
app.use('/static', express.static(__dirname + '/static'));
server.listen(3000, function () {
    console.log('Server starts listening on localhost:3000');
});


app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});


// Connected users list.
var users = {};

// Sent messages list.
var messages = [];


io.sockets.on('connection', function (socket) {
    var user = new User(socket);
    users[socket.id] = user;

    socket.on('disconnect', function () {
        delete users[socket.id];
        io.sockets.emit('/user/all', users);
    });


    // Users Manipulating
    // ==================

    // TODO Use a function factory wrapper.
    function notifyUpdateUsers() {
        io.sockets.emit('/user/all', users);
    }

    // Request for users list.
    socket.on('/user/all', function (from, data) {
        socket.emit('/user/all', users);
    });

    // Set user information.
    socket.on('/user/me/name/set', function (name) {
        users[socket.id].setName(name);
        notifyUpdateUsers();
    });

    // Get user information.
    socket.on('/user/me', function () {
        socket.emit('/user/me', users[socket.id]);
    });


    // Message Manipulating.
    // =====================

    // TODO Use a function factory wrapper.
    function notifyUpdateMessages() {
        io.sockets.emit('/message/all', messages);
    }

    // Request for messages list.
    socket.on('/message/all', function (from, data) {
        socket.emit('/message/all', messages);
    });

    // Post a new message.
    socket.on('/message/create', function (message) {
        messages.push(new Message(user, message));
        notifyUpdateMessages();
    });
    
    // Notify the new come user.
    notifyUpdateUsers();
});


function User(socket) {
    this.id = socket.id;
    this.name = socket.id;
}

User.prototype.setName = function (name) {
    this.name = name;
};

function Message(user, content) {
    this.user = user;
    this.content = content;
    this.timestamp = Date.now();
}
