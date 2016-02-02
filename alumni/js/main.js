
var map;
var lastOpened;

function initAutocomplete() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 39.6893269, lng: -94.5628872},
    zoom: 4,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  // custom map style
  map.set('styles', [
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#444444"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#eeeeee"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 45
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#3498DB"
            },
            {
                "visibility": "on"
            }
        ]
    }
  ]);

  // Create the search box and link it to the UI element.
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];
  // [START region_getplaces]
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
  // [END region_getplaces]
  addmarkers(map);
}

function addmarkers() {
  var public_spreadsheet_url = 'https://docs.google.com/spreadsheet/pub?hl=en_US&hl=en_US&key=1pvATcdW6J7YxovQC3pfr41q_q5rE3DcsUVADzNgbeFo&output=html';

  Tabletop.init({
    key: public_spreadsheet_url,
    callback: showInfo,
    simpleSheet: true
  });
}

function showInfo(data, tabletop) {
  console.log(d = data);
  var myLatLng;
  for (var i in data) {
    var row = data[i]
    var name = row['First Name'] + ' ' + row['Last Name']
    var address = row['street'] + ', ' + row['city'] + ', ' + row['state'] + ' ' + row['zipcode']
    console.log(address);
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': address}, geocodeResult(row));
  }
}

function geocodeResult(row) {
  return function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      name = row['First Name'] + ' ' + row['Last Name'];
      console.log('producing lat/lng')
      var myLatLng = new google.maps.LatLng(results[0].geometry.location.lat(), 
        results[0].geometry.location.lng());
      console.log('latlng' + myLatLng)
      var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        title: name
      });

      var method = '<span class="method">' + row['Contact Method'] + '</span>';
      var info = row['Contact Info'];
      if (isLink(info)) {
        method = '<a href="' + info + '" target="_blank">' + method + '</a>';
      } else {
        method = method + ': ' + info;
      }
      
      var contentString = '<div class="content">'+
      '<h1 class="firstHeading">' +
        (row['image_url'] ? '<img src="'+ row['image_url'] +'">':'') +
        '<div>'
        + name + '<div class="sub">' + method + '</div></div>' +
      '</h1>'+
      '<div class="body">'+
      '<p>'+ row['Description'] + '</p>'+
      '</div>'+
      '</div>';

      var infowindow = new google.maps.InfoWindow({
        content: contentString
      });
      marker.addListener('click', createMarkerClick(infowindow, marker));

    } else {
      console.log('lat/lng not produced');
    }
  };
}

function createMarkerClick(infowindow, marker){
  return function() {
    if (lastOpened)
      lastOpened.close()
    infowindow.open(map, marker);
    lastOpened = infowindow
  };
}

function isLink(str) {
  return str.indexOf('http') == 0;
}