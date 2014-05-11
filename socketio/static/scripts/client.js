(function () {
    var socket = io.connect('http://localhost:3000', { resource: 'chat' });
    var me;
    var users;
    var messages;

    // Events
    // ------
    
    socket.on('connect', function (data) {
        // Request for current user's informations.
        socket.emit('user-me');

        // Request for users list.
        socket.emit('users');

        // Request for messages list.
        socket.emit('messages');
    });

    socket.on('user-me', function (data) {
        me = data;
    });

    socket.on('users', function (data) {
        users = data;
        updateClientsList(users);
    });

    socket.on('users-update', function (data) {
        users = data;
        updateClientsList(users);
    });

    socket.on('messages', function (data) {
        messages = data;
        updateMessagesList(messages);
    });

    socket.on('messages-update', function (data) {
        messages = data;
        updateMessagesList(messages);
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

            buffer =  buffer + messagesListItemTmpl(message);
        }

        console.log('Refresh messages list...');
        messagesList.innerHTML = buffer;
        updateFuzzyTime();
    }

    var messageComposeContent = document.querySelector('.chat__messages__compose__text-input');

    messageComposeContent.addEventListener('keydown', function (e) {
        var content = messageComposeContent.value;

        if (e.keyCode === 13 && content !== '') {
            messageComposeContent.value = ''
            socket.emit('message-create', content);
        }
    });
})();
