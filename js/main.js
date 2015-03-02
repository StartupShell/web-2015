// HERO PARALLAX

var hero = document.getElementsByClassName("hero")[0];

window.onscroll = function() {
    var scrolled = window.pageYOffset;
    hero.style["background-position"] = "50% " + (scrolled / 4) + "px";
}