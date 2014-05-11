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

function toggleModal(modalElem) {
    var orig = modalElem.style.display;

    modalElem.style.display = orig === 'block' ? 'none' : 'block';
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
        return 'Just now';
    } else if (elapsed < msPerMinute) {
        return 'At ' + Math.round(elapsed / 1000) + ' seconds ago';
    } else if (elapsed < msPerHour) {
        return 'At ' + Math.round(elapsed / msPerMinute) + ' minutes ago';
    } else if (elapsed < msPerDay) {
        return 'At ' + Math.round(elapsed / msPerHour) + ' hours ago';
    } else if (elapsed < msPerMonth) {
        return 'At ' + Math.round(elapsed / msPerDay) + ' days ago';
    } else if (elapsed < msPerYear) {
        return 'At ' + Math.round(elapsed / msPerMonth) + ' months ago';
    } else {
        return 'At ' + Math.round(elapsed / msPerYear) + ' years ago';
    }
}

function updateFuzzyTime() {
    var selector = '.fuzzy-time__updatable',
        timestampField = 'data-fuzzy_time-timestamp',
        elems = document.querySelectorAll(selector),
        elemsCount = elems.length,
        elem,
        timestamp;

    for (var i = 0; i < elemsCount; i++) {
        elem = elems[i];
        timestamp = elem.attributes[timestampField].value;
        elem.innerHTML = fuzzyTime(timestamp);
    }
}

(function () {
    bindModals();
    setInterval(updateFuzzyTime, 5000);
})();
