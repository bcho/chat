(function () {
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

    bindModals();

    document.querySelector('.user-profile__modal__submit-btn').addEventListener('click', function (e) {
        e.preventDefault();

        console.log('Profile saved.');
    });
})();
