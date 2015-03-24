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

        // Check for cover override
        var override = [];
        gDesc.replace(/\{(.*?)\}/g, function(g0, g1) {
            override.push(g1);
        })

        if (override[0]) {
            data.cover = override[0];
        }

        // Get facebook event ID
        var matches = [];
        gDesc.replace(/\[(.*?)\]/g, function(g0, g1) {
            matches.push(g1);
        })

        // Get the first tag
        if (matches[0]) {

            // If link is from facebook
            if (matches[0].split('/')[2].indexOf('facebook') > -1) {

                // Try to get facebook event ID
                var eventID = '/' + matches[0].split('/')[4];
                fbEnsureInit(function() {

                    FB.api(
                        eventID + '?fields=cover',
                        function(response) {
                            if (response && !response.error) {
                                if (!data.cover) {
                                    data.cover = response.cover.source;
                                }
                                data.link = 'https://www.facebook.com/events/' + response.id;
                                callback(data);
                            } else {
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

                data.link = matches[0];
                callback(data);
            }


        } else {
            callback(data);
        }

    } else {
        callback(data);
    }

}

// EVENTS

// Format time
function timeFormat(dateInput, noTime) {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Return the formatted string
    if (noTime) {
        // Address timezone offset
        var timezoneOffset = dateInput.getTime() + (dateInput.getTimezoneOffset() * 60000);
        var date = new Date(timezoneOffset);
        date = [months[date.getMonth()], date.getDate()]
        return date.join(" ");
    } else {
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
        return date.join(" ") + ", " + time.join(":") + " " + suffix;
    }

}

// This is to template the data for the dom
function assembleStructure(data, index, callback) {
    // Reformat the data to a more friendly format

    var newData = {}
    if (!data.start.dateTime) {
        // All-day event
        newData.start = timeFormat(new Date(data.start.date), true);
    } else {
        newData.start = timeFormat(new Date(data.start.dateTime));
    }
    newData.end = new Date(data.end.dateTime);
    newData.description = data.description;
    newData.title = data.summary;
    newData.link = data.htmlLink;
    newData.location = data.location;
    newData.position = index;

    // Get the FB data for the event
    getCover(newData, function(fbData) {

        // If there's no cover image, use the default one
        if (!fbData.cover) {
            var cover = '<div class="image no-fb"><img src="../assets/shell-logo-wire.svg"></div>';
        } else {
            var cover = '<div class="image"><img src="' + fbData.cover + '"></div>';
        }

        // Display gCal description for featured event
        var description;
        if (fbData.position == 0 && fbData.description) {
            description = fbData.description;

            // Strip the [] and {} tags.
            description = description.replace(/\[(.*?)\]/g, "");
            description = description.replace(/\{(.*?)\}/g, "");
        }

        // Display gCal location if it has one
        var location;
        if (fbData.location) {
            location = ' @ ' + fbData.location;
        }

        // Return this structure
        var ret = ['<a target="_blank" href="', fbData.link, '"><div class="details">',
            cover,
            '<div class="meta">',
            '<h2 class="title">', fbData.title, '</h2>',
            '<p class="date">', newData.start, location, '</p>',
            '<p class="description">', description, '</p>',
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

var eventsCounter = 0;

$.ajax({
    url: url
}).done(function(data) {
    // Begin parsing
    data.items

    // Get rid of reoccuring
        .filter(function(i) {
        if (i.hasOwnProperty('start') && i.hasOwnProperty('end')) {
            return true;
        }
    })

    // Get the ones that havent happend yet
    .filter(function(i) {
        if (i.end.dateTime) {
            return new Date(i.end.dateTime) >= new Date().getTime();
        } else {
            // The event is all-day, so use the start time
            // We add 86400000 (24 hours) so that the event still displays throughout the entire day
            return new Date(i.end.date) >= new Date().getTime();
        }
    })


    // Sort by date
    .sort(function(a, b) {
        var first = a.start.dateTime || a.start.date;
        var second = b.start.dateTime || b.start.date;
        return new Date(first) - new Date(second);
    })

    .filter(function(i) {
        if ($('.events').hasClass('limit-3') && eventsCounter < 3) {
            eventsCounter++;
            return true;
        } else if (!$('.events').hasClass('limit-3')) {
            return true;
        }
    })


    // The assemble the structure
    .forEach(function(i, index) {
        // Make a blank element
        $('.events').append('<div class="event"></div>');

        assembleStructure(i, index, function(assembled, position) {
            // And add it to the blank element in [position] position.
            // This solves the async issue of our requests coming back at different times
            $('.events .event').eq(position).html(assembled);

            // Feature first
            if (position == 0) {
                $('.events .event:first-child').addClass('featured');
            }

        })

    });

});
