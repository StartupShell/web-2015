// FACEBOOK
function fbEnsureInit(callback) {
    if (!window.fbApiInit) {
        setTimeout(function() {
            fbEnsureInit(callback);
        }, 50);
    } else {
        if (callback) {
            callback();
        }
    }
}
window.fbAsyncInit = function() {
    FB.init({
        appId: '803530653059405',
        status: true,
        cookie: true,
        xfbml: true,
        version: 'v2.2'
    });

    fbApiInit = true;
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

// Reformat data & get facebook cover from google events description
function getCover(data, callback) {

    gDesc = data.description;
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
            fbEnsureInit(function() {
                FB.api(
                    eventID + '?fields=cover',
                    function(response) {
                        if (response && !response.error) {
                            data.cover = response.cover.source;
                            data.link = 'https://www.facebook.com/events/' + response.id;
                            callback(data);
                        }
                    }, {
                        access_token: '803530653059405|GkX1fG84RU3rCKQL_epc_AT7ZaA',
                        redirect: false,
                        type: 'normal'
                    }
                );
            })


        } else {
            callback(data);
        }

    } else {
        callback(data);
    }

}

// EVENTS

// Format time
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

// This is to template the data for the dom
function assembleStructure(data, index, callback) {

    // Reformat the data to a more friendly format
    var newData = {}
    newData.start = new Date(data.start.dateTime);
    newData.end = new Date(data.end.dateTime);
    newData.description = data.description;
    newData.title = data.summary;
    newData.link = data.htmlLink;
    newData.position = index;

    // Get the FB data for the event
    getCover(newData, function(fbData) {
        console.log(fbData);
        var startString = timeFormat(new Date(fbData.start));

        // If there's no cover image, use the default one
        if (!fbData.cover) {
            var cover = '<div class="image no-fb"><img src="../assets/shell-logo-wire.svg"></div>';
        } else {
            var cover = '<div class="image"><img src="' + fbData.cover + '"></div>';
        }

        // Return this structure
        var ret = ['<a href="', fbData.link, '"><div class="details">',
            cover,
            '<div class="meta">',
            '<h2 class="title">', fbData.title, '</h2>',
            '<div class="date">',
            startString,
            '</div>',
            '</div>',
            '</div></a>'
        ].join('');

        callback(ret, fbData.position);
    })

}

// This is where to get the data from
var url = ['https://www.googleapis.com/calendar/v3/calendars',
    '/7qvrobfs0js5799ebugodgc5go@group.calendar.google',
    '.com/events?key=AIzaSyDd9bnLFkG8tyRgmjttiFRTT0MTtYpkZb8'
].join('');


var request = new XMLHttpRequest();
request.open('GET', url, true);

request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(request.responseText);

        // Begin parsing
        data.items

        // Get rid of reoccuring
            .filter(function(i) {
            if (i.hasOwnProperty('start')) {
                return true;
            }
        })

        // Get the ones that havent happend yet
        .filter(function(i) {
            return new Date(i.end.dateTime) >= new Date().getTime();
        })

        // Sort by date
        .sort(function(a, b) {
            return new Date(a.start.dateTime) - new Date(b.start.dateTime);
        })

        // The assemble the structure
        .forEach(function(i, index) {
            // Make a blank element
            var eventStream = document.getElementById("eventStream");
            eventStream.innerHTML = eventStream.innerHTML + '<div class="event"></div>';

            assembleStructure(i, index, function(assembled, position) {
                // And add it to the blank element in [position] position.
                // This solves the async issue of our requests coming back at different times
                var eventStream = document.getElementById("eventStream");
                eventStream.getElementsByClassName('event')[position].innerHTML = assembled;

                // Feature first
                if (position == 0) {
                    var first = eventStream.getElementsByClassName('event')[position];
                    first.className = first.className + ' featured';
                }

            })

        });

    } else {
        // We reached our target server, but it returned an error
        var eventStream = document.getElementById("eventStream");
        eventStream.innerHTML = eventStream.innerHTML + "An error has occurred. Sorry!";
    }
};

request.onerror = function() {
    // There was a connection error of some sort
    var eventStream = document.getElementById("eventStream");
    eventStream.innerHTML = eventStream.innerHTML + "Cannot connect to Google Calendar. Sorry!";
};

request.send();
