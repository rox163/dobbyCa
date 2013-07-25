var ottawa = new google.maps.LatLng(45.4214, -75.6919);
var map;
var markers = [];
var geocoder = new google.maps.Geocoder();;

var infowindow = new google.maps.InfoWindow();
var contentString = '<div>' + '<h3>%user</h3>' + '<div>' + '<p>%phone</p>' + '</div>' + '</div>'; 
var walkerData = [];
// {
//        "User": "Dwight",
//        "Phone": "6472342334",
//        "Email": "dwight@gmgirn.com",
//        "Postcode": "ky4x8"
// }

function DogWalker(user, phone, email, postcode) {
    var self = this;
    self.user = user;
    self.phone = phone;
    self.email = email;
    self.postcode = postcode;
    // password??
    geocoder.geocode( {'address': self.postcode}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                self.lat_long = results[0].geometry.location;
            }
        });
}
// Initialise validation plugin
ko.validation.init({
    parseInputAttributes: false,
    decorateElement: true,
    insertMessages: true,
    messagesOnModified: true,
    grouping: { deep: true, observable: true }
});



function ResultsViewModel() {
    var self = this;

    self.Walkers = ko.observableArray();
    self.bindToWalkers = function() {
        self.Walkers();
    }
    self.k_query = ko.observable('');
    // controls visibility of the list
    self.k_showWalkers = ko.observable(false);

    // login modal observables
    self.k_new_user = ko.observable().extend({ required: true, minLength: 2 });
    self.k_new_phone = ko.observable().extend({ 
        required: true, 
        pattern: {
                    message: '10 digit number only',
                    params: '^[2-9]{1}[0-9]{2}[0-9]{7}$'
                 } 
        });
    self.k_new_email = ko.observable().extend({ required: true, email: true });
    self.k_new_postcode = ko.observable().extend({ required: true });

    self.search = function() {
        var temp =[];
        $.ajax({
            async: false,
            url:'/api/walkers',
            type:'GET',
            dataType:'json',
            success: function(data) {
                $.each(data, function(index) {                    
                    if (data[index].Uid > self.Walkers.length) {
                        console.log(data[index]);
                        temp.push(new DogWalker(data[index].User, data[index].Phone, data[index].Email, data[index].Postcode));
                    }
                });
                // console.log(walkerData.length);
                self.Walkers(temp);
            },
            error: function() {
                alert("error");
            }
        });        
        console.log(self.Walkers().length);
        self.k_showWalkers(true);
        plotMarkers();
    }

    self.k_walkers = ko.dependentObservable(function() {
        self.bindToWalkers();
        return ko.utils.arrayFilter(self.Walkers, function(walker) {
            return walker.postcode.toLowerCase().indexOf(self.k_query().toLowerCase()) >= 0;
        });
    }, self);
    //Show info window over map marker when walker user is clicked
    self.showDetail = function(walker) {
        for (var i = 0; i < markers.length; i++) {
            if (getDistanceFromLatLonInKm(markers[i].position.lat(), markers[i].position.lng(),
                walker.lat_long.lat(), walker.lat_long.lng()) <= 0.1 ) {
                infowindow.close();
                infowindow.setContent(contentString.replace('%user', walker.user).replace('%phone', walker.phone));
                infowindow.open(map, markers[i]);
            }
        }
    }

    // new walker validation and post
    self.submitWalker = function () {
        if (self.errors().length == 0) {
            alert('Thank you.');
            self.createWalker();
        } else {
            //alert('Please check your submission.');
            self.errors.showAllMessages();
        }
    }

    self.errors = ko.validation.group(self);

    // post data to server
    self.createWalker = function() {
        var dataToSave = new DogWalker(self.k_new_user(), self.k_new_phone(),
            self.k_new_email(), self.k_new_postcode());
        $.ajax({
            url: "/api/walkers",
            type: "POST",
            data: JSON.stringify(dataToSave),
            processData:false,
            contentType: "application/json",
            dataType:"json",
            success: function (result) {
                    alert("Success");
                    $('#create-tab')[0].reset();
                    $('#loginModal').modal('hide');
                    },
            error: function (result) {
                alert(result.responseText);
                }
        });    
    }
}

$('a[data-toggle="tab"]:first').tab('show');

$('#loginModal').on('hide', function () {
    $('span').css({display: "none" });
    $('#create-tab')[0].reset();
    $('#login-tab')[0].reset();
});

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
        content: 'Ottawa'
    });
        //center not working without info window
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