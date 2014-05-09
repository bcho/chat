var express = require('express'),
    app = express()
    server = require('http').createServer(app);

// Serve static file via express's middleware.
app.use('/static', express.static(__dirname + '/static'));
server.listen(3000, function () {
    console.log('Server starts listening on localhost:3000');
});

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});


var mows = require('mows');

var users = new UsersCollection(),
    messages = new MessagesCollection();

// mqtt server setup.
mows.attachServer(server, function (client) {
    var that = this;

    client.on('connect', function (packet) {
        var user;

        client.connack({returnCode: 0});

        user = new User(packet, client);
        users.add(user);
        client.user = user;
        
        console.log('New user %s connected.', user.id);
    });

    client.on('disconnect', function (packet) {
        // TODO how it works?
        client.stream.end();
        console.log('User %s disconnected.', client.user.id);
    });

    client.on('close', function (err) {
        // TODO how it works?
        users.remove(client.user);
        console.log('User %s closed.', client.user.id);
    });

    client.on('error', function (e) {
        // TODO how it works?
        client.stream.end();
        console.log('Got error from user %s.', client.user.id, e);
    });

    client.on('subscribe', function (packet) {
        // TODO how it works?
        var granted = [];
        for (var i = 0; i < packet.subscriptions.length; i++) {
            granted.push(packet.subscriptions[i].qos);
        }

        client.suback({granted: granted, messageId: packet.messageId});
    });

    client.on('pingreq', function (packet) {
        // TODO how it works?
        client.pingresp();
    });


    // TODO refactory matching logic.
    client.on('publish', function (packet) {
        var topic = packet.topic;

        console.log('Receive topic: %s from user %s', topic, client.user.id);
        if (topic === 'user-me') {
            client.user.publish({
                topic: topic,
                payload: JSON.stringify(client.user.getValues())
            });
        } else if (topic === 'user-set-name') {
            client.user.setName(packet.payload);
            users.notifyUpdate();
        } else if (topic === 'messages') {
            client.user.publish({
                topic: topic,
                payload: JSON.stringify(messages.messagesList())
            });
        } else if (topic === 'message-create') {
            messages.add(client.user, packet.payload);
            notifyUpdateMessages();
        }
    });

    function notifyUpdateMessages() {
        users.broadcast({
            topic: 'messages-update',
            payload: JSON.stringify(messages.messagesList())
        });
    }
});


function User(packet, client) {
    this.id = packet.clientId;
    this.name = packet.clientId;
    this.client = client;
}

User.prototype.setName = function (name) {
    this.name = name;
};

User.prototype.publish = function (message) {
    this.client.publish(message);
};

User.prototype.getValues = function () {
    return {
        id: this.id,
        name: this.name
    };
};

function UsersCollection() {
    this.users = {};
}

UsersCollection.prototype.add = function (user) {
    this.users[user.id] = user;
    this.notifyUpdate();
};

UsersCollection.prototype.remove = function (user) {
    delete this.users[user.id];
    this.notifyUpdate();
};

UsersCollection.prototype.broadcast = function (message) {
    for (var uid in this.users) {
        this.users[uid].publish(message);
    }
};

UsersCollection.prototype.usersList = function () {
    var rv = [];
    for (var uid in this.users) {
        rv.push({
            id: uid,
            name: this.users[uid].name
        });
    }

    return rv;
};

UsersCollection.prototype.notifyUpdate = function () {
    this.broadcast({
        topic: 'users-update',
        payload: JSON.stringify(this.usersList())
    });
};

function Message(user, content) {
    this.user = user;
    this.content = content;
    this.timestamp = Date.now();
}

Message.prototype.getValues = function () {
    return {
        user: this.user.getValues(),
        content: this.content,
        timestamp: this.timestamp
    };
};

function MessagesCollection() {
    this.messages = [];
}

MessagesCollection.prototype.add = function (user, content) {
    this.messages.push(new Message(user, content));
};

MessagesCollection.prototype.messagesList = function() {
    var rv = [];
    for (var i = 0; i < this.messages.length; i++) {
        rv.push(this.messages[i].getValues());
    }

    return rv;
};
