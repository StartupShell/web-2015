// HERO PARALLAX

// $(document).ready(function() {
//     $(window).scroll(function() {
//         var scrolled = window.pageYOffset;
//         $('.hero').css("background-position", "50% " + (60 + (scrolled / 25)) + "%");
//     })
// });

// COLLAPSE MENU

$(document).ready(function() {
    $('.slide-button').click(function() {
        $('.menu').toggleClass('open');
    })
});

// MAILCHIMP
// -- Adapted from http://stackoverflow.com/questions/8425701/ajax-mailchimp-signup-form-integration

$(document).ready(function() {

    // Validate email
    function isEmail(email) {
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return regex.test(email);
    }

    if ($('.subscribe form').length > 0) {
        $('form input[type="submit"]').bind('click', function(event) {
            if (event) event.preventDefault();

            if (!isEmail($(".subscribe form [name='email']").val())) {
                alert('Email address is not valid.');
            } else {
                register($('.subscribe form'));
            }
        });
    }
});

function register($form) {
    // Prepare for Mailchimp
    var email = $form.find('input[type=email]');
    email.attr('name', 'EMAIL');

    var data = {};
    var dataArray = $form.serializeArray();
    $.each(dataArray, function(index, item) {
        data[item.name] = item.value;
    });

    $.ajax({
        url: '//startupshell.us8.list-manage2.com/subscribe/post-json?u=ab309f640b0f94f8e5fd0a2e8&amp&id=af8824bb76&c=?',
        data: data,
        dataType: 'jsonp',
        error: function(err) {
            alert("Could not connect to the subscription server. Please try again later.");
        },
        success: function(data) {
            if (data.result != "success") {
                alert("Submittion error. Please try again.");
            } else {
                $('.subscribe form input[type=submit]').prop('value', 'Success!');
            }
        }
    });
}


// ADD TO GOOGLE CALENDAR
(function() {
    if (window.addtocalendar)
        if (typeof window.addtocalendar.start == "function") return;
    if (window.ifaddtocalendar == undefined) {
        window.ifaddtocalendar = 1;
        var d = document,
            s = d.createElement('script'),
            g = 'getElementsByTagName';
        s.type = 'text/javascript';
        s.charset = 'UTF-8';
        s.async = true;
        s.src = ('https:' == window.location.protocol ? 'https' : 'http') + '://addtocalendar.com/atc/1.5/atc.min.js';
        var h = d[g]('body')[0];
        h.appendChild(s);
    }
})();
