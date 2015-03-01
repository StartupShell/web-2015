// HERO PARALLAX

var hero = document.getElementsByClassName("hero")[0];

window.onscroll = function() {
    var scrolled = window.pageYOffset;
    hero.style["background-position"] = "50% " + (scrolled / 4) + "px";
}

// FACEBOOK
var loaded = false;
window.fbAsyncInit = function() {
    FB.init({
        appId: '803530653059405',
        status: true,
        cookie: true,
        xfbml: true,
        version: 'v2.2'
    });
};

(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Get facebook cover from google events description
function getCover(gDesc) {
    gDesc = '[https://www.facebook.com/events/432650743556252]This is a test description!';
    if (gDesc) {

        // Get facebook event ID
        var matches = [];
        gDesc.replace(/\[(.*?)\]/g, function(g0, g1) {
            matches.push(g1);
        })

        // Get the first tag
        if (matches[0]) {
            // Try to get facebook event ID
            var eventID = '/' + matches[0].split('/')[4];

            FB.api(
                eventID + '/picture',
                function(response) {

                    if (response && !response.error) {
                        var cover = new Image();
                        cover.src = response.data.url;
                        return cover;
                    } else {
                        return '';
                    }
                }, {
                    access_token: '803530653059405|GkX1fG84RU3rCKQL_epc_AT7ZaA',
                    redirect: false,
                    type: 'large'
                }
            );

        }

    }
}
// EVENTS

// format time
function timeFormat(dateInput) {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var date = [months[dateInput.getMonth()], dateInput.getDate()];
    var time = [dateInput.getHours(), dateInput.getMinutes()];
    var suffix = (time[0] < 12) ? "AM" : "PM";
    time[0] = (time[0] < 12) ? time[0] : time[0] - 12;
    time[0] = time[0] || 12;
    for (var i = 1; i < 3; i++) {
        if (time[i] < 10) {
            time[i] = "0" + time[i];
        }
    }

    // Return the formatted string
    return date.join(" ") + " at " + time.join(":") + " " + suffix;
}

// this is to template the data for the dom
function assembleStructure(data, index) {
    var d = new Date(data.start);
    var startString = timeFormat(d);
    if (index == 0) {
        var featured = ' featured';
    }
    return ['<div class="event',
        featured || '',
        '">',
        '<div class="image">',

        data.cover,

        '</div>',
        '<div class="meta">',
        '<div class="title"><a href=', data.link, '>', data.title, '</a></div>',
        '<div class="date">',
        startString,
        '</span>',
        '</div>',
        '</div>'
    ].join('');
}

// this is where to get the data from
var url = ['https://www.googleapis.com/calendar/v3/calendars',
    '/7qvrobfs0js5799ebugodgc5go@group.calendar.google',
    '.com/events?key=AIzaSyDd9bnLFkG8tyRgmjttiFRTT0MTtYpkZb8'
].join('');


var request = new XMLHttpRequest();
request.open('GET', url, true);

request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(request.responseText);

        // begin parsing
        data.items

        // get rid of reoccuring
            .filter(function(i) {
            if (i.hasOwnProperty('start')) {
                return true;
            }
        })

        // get the ones that havent happend yet
        .filter(function(i) {
            return new Date(i.end.dateTime) >= new Date().getTime();
        })

        //reformat
        .map(function(i) {
            return {
                start: new Date(i.start.dateTime),
                end: new Date(i.end.dateTime),
                title: i.summary,
                cover: getCover(i.description),
                link: i.htmlLink
            }
        })

        // Sort by date
        .sort(function(a, b) {
            return new Date(a.start) - new Date(b.start);
        })

        // append to DOM
        .forEach(function(i, index) {
            var eventStream = document.getElementById("eventStream");
            eventStream.innerHTML = eventStream.innerHTML + assembleStructure(i, index);
        });

    } else {
        // We reached our target server, but it returned an error

    }
};

request.onerror = function() {
    // There was a connection error of some sort
};

request.send();