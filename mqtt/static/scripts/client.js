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
        hightlightMe();
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

// Current User Highlighting
// =========================

var isMeTagTmpl = _.template('[data-user-id=<%= id %>]');
var isMeClassName = 'chat-client--is-me';

function hightlightMe() {
    if (me === undefined) {
        return;
    }

    var nodes = document.querySelectorAll(isMeTagTmpl(me));

    for (var i = 0; i < nodes.length; i++) {
        nodes[i].classList.add(isMeClassName);
    }
}


// Clients List
// ============

var clientsList = document.querySelector('.chat-clients__list');
var clientsListItemTmpl = t('.chat-clients__list__client--tmpl');

function updateClientsList(clients) {
    var buffer = '';

    for (var i in clients) {
        buffer = buffer + clientsListItemTmpl(clients[i]);
    }

    console.log('Refresh clients list...');
    clientsList.innerHTML = buffer;

    hightlightMe();
}


// Messages
// ========

var messagesList = document.querySelector('.chat-window__bubbles');
var messagesListItemTmpl = t('.chat-window__bubbles__item--tmpl');

function updateMessagesList(messages) {
    var buffer = '';

    for (var i = 0; i < messages.length; i++) {
        buffer =  buffer + messagesListItemTmpl(messages[i]);
    }

    console.log('Refresh messages list...');
    messagesList.innerHTML = buffer;
    
    hightlightMe();
}

var messageComposeContent = document.querySelector('.chat-window__input__text');
var messageComposeButton = document.querySelector('.chat-window__input__submit');

messageComposeButton.onclick = function (e) {
    e.preventDefault();

    var content = messageComposeContent.value;
    messageComposeContent.value = '';

    if (content === '') {
        return;
    }

    client.publish('message-create', content);
};
