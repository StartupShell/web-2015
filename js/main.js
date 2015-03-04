// HERO PARALLAX

$(document).ready(function() {
    $(window).scroll(function() {
        var scrolled = window.pageYOffset;
        $('.hero').style["background-position"] = "50% " + (50 + (scrolled / 25)) + "%";
    })
});

// COLLAPSE MENU

function mobileMenu() {
    var width = $(window).width();

    if (width < 720) {
        $('.slide-button').show();
        $('.slide-button').click(function() {
            $('.menu').toggleClass('open');
        })
    } else {
        $('.slide-button').hide();
    }


}

$(document).ready(function() {
    mobileMenu();
});

$(window).resize(function() {
    mobileMenu();
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
