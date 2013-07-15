var ottawa = new google.maps.LatLng(45.4214, -75.6919);
var map;
var markers = [];
var geocoder;
var walkerData = [ 
    {name: "Pam Beasley", phone: "8194561234", email: "asd@asd.com", postcode: "k1y4x8"},
    {name: "Jim Halpert", phone: "6131234563", email: "TEST@test.com", postcode: "k2b8e5"},
    {name: "Michael Scott", phone: "4561212123", email:"erty@asd.com", postcode: "k2b7g9"}
];

// var simulatedAjaxData = {
//     'persons' : [
//         { firstName: "John", lastName: "Smith" },
//         { firstName: "Sgt.", lastName: "Shiney-Sides" },
//         { firstName: "Rusty", lastName: "Schacklefurt" }
//     ]
// };

function DogWalker() {
    var self = this;
    self.name = ko.observable();
    self.phone = ko.observable();
    self.email = ko.observable();
    self.postcode = ko.observable();
}

function ResultsViewModel() {
    var self = this;
    self.k_query = ko.observable('');
    self.k_showWalkers = ko.observable(false);
    self.search = function() {
        self.k_showWalkers(true);   
        plotMarkers();     
    }   
    
    self.k_walkers = ko.dependentObservable(function() {
        return ko.utils.arrayFilter(walkerData, function (walker) {
            return walker.postcode.toLowerCase().indexOf(self.k_query().toLowerCase()) >= 0;
        });
    });    
    
}

var resultsModel = new ResultsViewModel();
resultsModel.k_query.subscribe(resultsModel.search);
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
}

google.maps.event.addDomListener(window, 'load', initialize);

function plotMarkers() {
   
    var filtered_walkers = resultsModel.k_walkers();
    setAllMap(null);
    markers = [];
    for (var i=0; i < filtered_walkers.length; i++) {
        //remove hardcoded data
        codeAddress(filtered_walkers[i].postcode);
    }
    setAllMap(map);
}

function codeAddress(postcode) {
    geocoder.geocode( {'address': postcode}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var marker = new google.maps.Marker({
                position: results[0].geometry.location,
                map: map
            });
            markers.push(marker);
        } else {
            console.log("Geocode was not successful for the following reason: " + status);
        }
    });
}

function setAllMap(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
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

