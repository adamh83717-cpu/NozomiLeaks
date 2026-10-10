(function () {
    'use strict';
    var loginForm = document.getElementById('login-form');
    var signupForm = document.querySelector('.panel form[method="post"]');
    if (signupForm && signupForm.username) {
        signupForm.username.addEventListener('input', function () {
            var cleaned = this.value.replace(/[^A-Za-z0-9_]/g, '');
            if (cleaned !== this.value) this.value = cleaned;
        });
    }
    if (!loginForm) return;
    var pending = false;
    var button = loginForm.querySelector('button');
    var output = document.getElementById('login-error');
    function finish(message) {
        pending = false;
        button.disabled = false;
        button.textContent = 'Log In';
        output.textContent = message || '';
    }
    window.addEventListener('pageshow', function (event) {
        if (event.persisted) finish();
    });
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        if (pending) return;
        pending = true;
        button.disabled = true;
        button.textContent = 'Signing in…';
        output.textContent = '';
        var request = new XMLHttpRequest();
        request.open('POST', '/v2/login');
        request.timeout = 15000;
        request.setRequestHeader('Content-Type', 'application/json');
        request.onload = function () {
            if (request.status >= 200 && request.status < 300) {
                button.textContent = 'Opening home…';
                window.location.replace('/home');
                return;
            }
            var message = 'Sign-in is unavailable. Please try again.';
            try {
                var response = JSON.parse(request.responseText);
                if (response.errors && response.errors[0] && response.errors[0].message)
                    message = response.errors[0].message;
            } catch (_) {}
            finish(message);
        };
        request.onerror = function () { finish('Could not connect. Please try again.'); };
        request.ontimeout = function () { finish('Sign-in took too long. Please try again.'); };
        request.send(JSON.stringify({username: loginForm.username.value, password: loginForm.password.value}));
    });
}());
