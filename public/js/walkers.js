var ottawa = new google.maps.LatLng(45.4214, -75.6919);
var map;
var geocoder;
var walkerData = [ 
    {name: "Pam Beasley", phone: "8194561234", email: "asd@asd.com", postcode: "k1y4x8"},
    {name: "Jim Halpert", phone: "6131234563", email: "TEST@test.com", postcode: "k2b8e5"},
    {name: "Michael Scott", phone: "4561212123", email:"erty@asd.com", postcode: "k2b7g9"}
];

function DogWalker() {
    var self = this;
    self.name = ko.observable();
    self.phone = ko.observable();
    self.email = ko.observable();
    self.postcode = ko.observable();
}

function ResultsViewModel() {
    var self = this;
    self.walkers = ko.observableArray(walkerData);

    self.query = ko.observable('');
    self.showWalkers = ko.observable(false);

    self.search = function() {

        // for (var i in self.walkers) {
        //     if (self.walkers[i].postcode.toLowerCase().indexOf(self.query.toLowerCase()) <= 0) {
        //         self.walkers.remove(self.walkers[i]);
        //     }
        // }
        alert("Handler for .click() called. " + $("#postcode_input").val());
        resultsModel.showWalkers(true);
    }
    // for (var i = 0; i < json.length; i++) {
        
    //     var item = new DogWalker(json[i]);
    //     console.log(item.phone)
    //     self.walkers.push(item);
    // }
}
var resultsModel = new ResultsViewModel();
resultsModel.query.subscribe(resultsModel.search);
ko.applyBindings(resultsModel);


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
    for (i=0; i < walkerData.length; i++) {
        //remove hardcoded data
        codeAddress(walkerData[i].postcode);
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
        position: ottawa,
        content: content
    };
    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
}

google.maps.event.addDomListener(window, 'load', initialize);
