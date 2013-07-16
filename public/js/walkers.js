var ottawa = new google.maps.LatLng(45.4214, -75.6919);
var map;
var markers = [];
var geocoder = new google.maps.Geocoder();;

var infowindow = new google.maps.InfoWindow();
var contentString = '<div>' + '<h3>%user</h3>' + '<div>' + '<p>%phone</p>' + '</div>' + '</div>'; 
var walkerData = [ 
    new DogWalker("Pam Beasley", "8194561234", "asd@asd.com", "k1y4x8"),
    new DogWalker("Jim Halpert", "6131234563", "TEST@test.com", "k2b8e5"),
    new DogWalker("Michael Scott", "4561212123", "erty@asd.com", "k2b7g9")
];

// var simulatedAjaxData = {
//     'persons' : [
//         { firstuser: "John", lastuser: "Smith" },
//         { firstuser: "Sgt.", lastuser: "Shiney-Sides" },
//         { firstuser: "Rusty", lastuser: "Schacklefurt" }
//     ]
// };

function DogWalker(user, phone, email, postcode) {
    var self = this;
    self.user = user;
    self.phone = phone;
    self.email = email;
    self.postcode = postcode;
    geocoder.geocode( {'address': self.postcode}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                self.lat_long = results[0].geometry.location;
            }
        });
    
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
        return ko.utils.arrayFilter(walkerData, function(walker) {
            return walker.postcode.toLowerCase().indexOf(self.k_query().toLowerCase()) >= 0;
        });
    }); 

     //Show info window over map marker when walker user is clicked
    self.showDetail = function(walker) {
        for (var i = 0; i < markers.length; i++) {
            //can we compare these?
            if (getDistanceFromLatLonInKm(markers[i].position.lat(), markers[i].position.lng(), 
                walker.lat_long.lat(), walker.lat_long.lng()) <= 0.1 ) {
                infowindow.close();
                infowindow.setContent(contentString.replace('%user', walker.user).replace('%phone', walker.phone));
                infowindow.open(map, markers[i]);
            }
        }
    }         
}

var resultsModel = new ResultsViewModel();
resultsModel.k_query.subscribe(resultsModel.search);
ko.applyBindings(resultsModel);

// Map loading
function initialize() {
    
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
}

google.maps.event.addDomListener(window, 'load', initialize);

function plotMarkers() {   
    var filtered_walkers = resultsModel.k_walkers();
    setAllMap(null);
    markers = [];
    for (var i=0; i < filtered_walkers.length; i++) {
        codeAddress(filtered_walkers[i]);
    }
    setAllMap(map);
}


// Convert postcode to Lat/Long and create marker
function codeAddress(walker) {
    var marker;
    geocoder.geocode( {'address': walker.postcode}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            marker = new google.maps.Marker({
                position: results[0].geometry.location,
                map: map,
                title: walker.user
            });           
        } else {
            console.log("Geocode was not successful for the following reason: " + status);
        }
         //create listener for marker infowindow and set content
        function openInfoWindow() {
            infowindow.close();
            infowindow.setContent(contentString.replace('%user', walker.user).replace('%phone', walker.phone));
            infowindow.open(map, marker);
        }
        google.maps.event.addListener(marker, 'click', openInfoWindow);
        markers.push(marker);
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

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}