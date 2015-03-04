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

    if (width < 960) {
        // Wrap the nav & social in the .nav element
        $('.menu ul').wrapAll("<div class='links' />");

        // Hide the new element & show the hamburglar
        // $('nav .links').hide();
        $('nav .hamburglar').show();

        $('nav .hamburglar').click(function() {
            $('.menu').toggleClass('open');
            $('body').toggleClass('open');
        })

    } else {
    	// Unwrap if wrapped
    	if($('.menu ul').parent().is('.links')) {
    		$('.menu ul').unwrap();
    	}

    	$('nav .hamburglar').hide();
    }


}

$(document).ready(function() {
    mobileMenu();
});

$(window).resize(function() {
    mobileMenu();
});
