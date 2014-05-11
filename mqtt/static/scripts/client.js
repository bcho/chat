var mows = require('mows'),
    client = mows.createClient('ws://localhost:3000');

var me,
    users,
    messages;


// Subscribe to messages.
client.subscribe('user-me');
client.subscribe('users-update');
client.subscribe('messages');
client.subscribe('messages-update');

// Request for current user's informations.
client.publish('user-me', '');

// Request for users list.
client.publish('users', '');

// Request for messages list.
client.publish('messages', '');

client.on('message', function (topic, message) {
    console.log('Receive topic %s from server.', topic);

    // Events
    // ======
    // TODO refactory matching logic.

    if (topic === 'user-me') {
        me = JSON.parse(message);
    }

    if (topic === 'users') {
        users = JSON.parse(message);
        updateClientsList(users);
    }

    if (topic === 'users-update') {
        users = JSON.parse(message);
        updateClientsList(users);
    }

    if (topic === 'messages') {
        messages = JSON.parse(message);
        updateMessagesList(messages);
    }

    if (topic === 'messages-update') {
        messages = JSON.parse(message);
        updateMessagesList(messages);
    }
});


// Components Setup
// ----------------

// t for loading template.
var t = function (selector) {
    var tmpl = document.querySelector(selector).innerHTML;

    return _.template(tmpl);
};


// Clients List
// ============

var clientsList = document.querySelector('.chat__clients__list');
var clientsListItemTmpl = t('.chat__clients__client--tmpl');

function updateClientsList(clients) {
    var buffer = '';

    for (var i in clients) {
        buffer = buffer + clientsListItemTmpl(clients[i]);
    }

    console.log('Refresh clients list...');
    clientsList.innerHTML = buffer;
}


// Messages
// ========

var messagesList = document.querySelector('.chat__messages__list');
var messagesListItemTmpl = t('.chat__messages__message--tmpl');

function updateMessagesList(messages) {
    var buffer = '',
        message;

    for (var i = 0; i < messages.length; i++) {
        message = messages[i];
        
        message.fromMe = 'chat__messages__message--from-other';
        if (me && me.id === message.user.id) {
            message.fromMe = 'chat__messages__message--from-me';
            message.user.name = 'I';
        }

        message.fuzzyTime = fuzzyTime(message.timestamp);
        
        buffer =  buffer + messagesListItemTmpl(message);
    }

    console.log('Refresh messages list...');
    messagesList.innerHTML = buffer;
}


var messageComposeContent = document.querySelector('.chat__messages__compose__text-input');

messageComposeContent.addEventListener('keydown', function (e) {
    var content = messageComposeContent.value;

    if (e.keyCode === 13 && content !== '') {
        messageComposeContent.value = ''
        client.publish('message-create', content);
    }
});
