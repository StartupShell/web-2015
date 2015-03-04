// HERO PARALLAX

var hero = document.getElementsByClassName("hero")[0];

window.onscroll = function() {
    var scrolled = window.pageYOffset;
    hero.style["background-position"] = "50% " + (50 + (scrolled / 25)) + "%";
}


// MENU

function mobileMenu() {
	// Detect current browser width
	var screenWidth = document.body.clientWidth;

	if(screenWidth <= 960) {

		var menu = document.getElementsByClassName('menu')[0];

		if menu.hasClass()

		// Put social icons inside the menu

		var social = document.getElementsByClassName('social-list')[0];
		var menuList = document.getElementsByClassName('menu-list')[0];
		menuList.innerHTML = '<div class="menu-list">' + menuList.innerHTML + '<div class="social-list">' + social.innerHTML + '</div></div>';

		

		// Remove top level social menu
		menu.removeChild(menu.childNodes[1]);

		menu.className = menu.className + 'collapsed';

		// Collapse menu
	}
}

window.onresize = function() {
	mobileMenu()
}

mobileMenu();