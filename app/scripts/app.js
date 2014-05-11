function bindModals() {
    var modals = document.querySelectorAll('.modal-wrapper'),
    links = document.querySelectorAll('a[data-target]'),
    target;

    var showModalFactory = function (target) {
        var elem = document.querySelector(target),
        closeBtns = elem.querySelectorAll('.modal__close-btn');

        var hideModal = function (e) {
            e.preventDefault();

            elem.style.display = 'none';
        };

        for (var i = 0; i < closeBtns.length; i++) {
            closeBtns[i].addEventListener('click', hideModal);
        }

        return function (e) {
            e.preventDefault();

            elem.style.display = 'block';
        };
    };

    // Hide all modals.
    for (var i = 0; i < modals.length; i++) {
        modals[i].style.display = 'none';
    }

    // Bind toggle modal action to click event.
    for (var i = 0; i < links.length; i++) {
        target = links[i].attributes['data-target'].value;

        links[i].addEventListener('click', showModalFactory(target));
    }
}

function fuzzyTime(since) {
    var elapsed = Date.now() - since,
    
        msThreshold = 10 * 1000,    
        msPerMinute = 60 * 1000,
        msPerHour = msPerMinute * 60,
        msPerDay = msPerHour * 24,
        msPerMonth = msPerDay * 30,
        msPerYear = msPerMonth * 12;

    if (elapsed < msThreshold) {
        return 'just now';
    } else if (elapsed < msPerMinute) {
        return Math.round(elapsed / 1000) + ' seconds ago';
    } else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    } else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    } else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + ' days ago';
    } else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + ' months ago';
    } else {
        return Math.round(elapsed / msPerYear) + ' years ago';
    }
}

(function () {
    bindModals();
})();
