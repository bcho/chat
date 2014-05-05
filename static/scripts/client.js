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
        hightlightMe();
    });

    socket.on('users', function (data) {
        users = users;
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

        socket.emit('message-create', content);
    };
})();
