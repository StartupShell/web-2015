// FACEBOOK

window.fbAsyncInit = function() {
    FB.init({
        appId: '803530653059405',
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

            // FB.api(
            //     'StartupShell/events',
            //     function(response) {
            //         console.log('res');
            //         console.log(response);
            //         if (response && !response.error) {
            //             console.log('back');
            //             console.log(response);
            //         }
            //     }
            // );

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
function assembleStructure(data) {
    var d = new Date(data.start);
    var startString = timeFormat(d);
    return ['<div class="event">',
        '<div class="image">',
        '<img src="http://placehold.it/900x500">',
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
        .forEach(function(i) {
            var eventStream = document.getElementById("google-events");
            eventStream.innerHTML = eventStream.innerHTML + assembleStructure(i);
        });



    } else {
        // We reached our target server, but it returned an error

    }
};

request.onerror = function() {
    // There was a connection error of some sort
};

request.send();
