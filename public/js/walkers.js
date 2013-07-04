var newyork = new google.maps.LatLng(40.69847032728747, -73.9514422416687);
var map;
var geocoder;
var walkerArray = [
        new DogWalker("Pam Beasley", "8194561234", "asd@asd.com", "k1y4x8"),
        new DogWalker("Jim Halpert", "6131234563", "TEST@test.com", "k2b8e5"),
        new DogWalker("Michael Scott", "4561212123", "erty@asd.com", "k2b7g9")
        ];

function DogWalker(name, phone, email, postcode) {
    var self = this;
    self.name = name;
    self.phone = phone;
    self.email = email;
    self.postcode = postcode;
}

function ResultsViewModel() {
    var self = this;
    self.walkers = ko.observableArray(walkerArray);
}

ko.applyBindings(new ResultsViewModel());

// Map loading
function initialize() {
    geocoder = new google.maps.Geocoder();
    var mapOptions = {
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
        var pos = new google.maps.LatLng(position.coords.latitude,
        position.coords.longitude);

        var infowindow = new google.maps.InfoWindow({
        map: map,
        position: pos,
        content: 'Location found using HTML5.'
    });
        map.setCenter(pos);
    }, function() {
        handleNoGeolocation(true);
    });
    } else {
    // Browser doesn't support Geolocation
        handleNoGeolocation(false);
    }
    console.log("done");
    plotMarkers();

}

function plotMarkers() {
    var marker, i;
    for (i=0; i < walkerArray.length; i++) {
        codeAddress(walkerArray[i].postcode);
    }
}

function codeAddress(postcode) {
    console.log(postcode);
    geocoder.geocode( {'address': postcode}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            marker = new google.maps.Marker({
                position: results[0].geometry.location,
                map: map
            });
        } else {
            console.log("Geocode was not successful for the following reason: " + status);
        }
    });
}

function handleNoGeolocation(errorFlag) {
    if (errorFlag) {
        var content = 'Error: The Geolocation service failed.';
    } else {
        var content = 'Error: Your browser doesn\'t support geolocation.';
    }
    var options = {
        map: map,
        position: newyork,
        content: content
    };
    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
}

google.maps.event.addDomListener(window, 'load', initialize);
