var ottawa = new google.maps.LatLng(45.4214, -75.6919);
var map;
var gMarkers = [];
var geocoder = new google.maps.Geocoder();
var loggedInWalker;

var infobox = new InfoBox();
var contentString = '<div>' + '<h4>%user</h4>' + '<p>%phone</p>' + '</div>';    
    //'<div>' + '<h4>%user</h4>' + '<p>%phone</p>' + '</div>';
var infoBoxOptions = {
    boxStyle: {
        border: "1px solid black",
        background: "white",
        width: "180px",
        pixelOffset: new google.maps.Size(-120, 0),
        padding: "2px",
        textAlign: "center",
        opacity: 0.85
    },
    pane: "floatPane",
    maxWidth: 0    
}

var walkerData = [];
// {
//        "User": "Dwight",
//        "Pwd": "123", 
//        "Phone": "6472342334",
//        "Email": "dwight@gmgirn.com",
//        "Postcode": "ky4x8"
// }

function DogWalker(user, password, phone, email, postcode) {
    var self = this;
    self.user = user;
    self.phone = phone;
    self.email = email;
    self.postcode = postcode;
    self.pwd = password;
    geocoder.geocode({'address': self.postcode}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            self.lat_long = results[0].geometry.location;
        }
    });
}

function ResultsViewModel() {
    var self = this;
    // Observables
    self.Walkers = ko.observableArray();
    self.k_query = ko.observable('');
    self.k_walkerName = ko.observable('');
    // controls visibility of the list
    self.k_showWalkers = ko.observable(false);    
    
    // switch for results found
    self.k_resultsFound = ko.observable(false);
    
    // login modal observables
    self.k_email = ko.observable('');
    self.k_password = ko.observable('');
    self.isComplete = ko.computed(function () {
        return (self.k_email().length > 0 && self.k_password().length > 0);
    });

    // register new walker modal observables  
    self.k_new_user = ko.observable('');
    self.k_new_password = ko.observable('');
    self.k_confirm = ko.observable('');
    self.isConfirmed = ko.computed(function () {
        if (self.k_new_password().length > 0 && self.k_confirm().length >= 0) {
            return self.k_new_password() === self.k_confirm();
        }
        return false;
    });
    self.k_new_phone = ko.observable('');
        // pattern: {
        //             message: '10 digit number only',
        //             params: '^[2-9]{1}[0-9]{2}[0-9]{7}$'
        //          }
    self.k_new_email = ko.observable('');
    self.k_new_postcode = ko.observable('');

    self.k_walkers = ko.dependentObservable(function () {
        return ko.utils.arrayFilter(self.Walkers(), function (walker) {
          // filter by distance
            return walker.postcode.toLowerCase().indexOf(self.k_query().toLowerCase()) >= 0;
        });
    }, self);

    // Actions
    self.loginWalker = function () {
        if (self.k_email().length > 0 && self.k_password().length > 0) {
            $('span').css({display: "none" });
            var dataToSend = self.k_email();
            if (self.isComplete()) {
                console.log("IN");
                $.ajax({
                    url: "/api/walkers" + "/" + dataToSend,
                    type: "GET",
                    dataType: "json",
                    success: function (result) {
                        if (self.k_password() === result.Pwd) {
                            alert("Success");
                            loggedInWalker = new DogWalker(result.User, result.Pwd, result.Phone, result.Email, result.Postcode);
                            self.k_walkerName("Welcome " + loggedInWalker.user);
                            $('#walker-name').css({display: "inline-block" });
                            self.k_password('');
                            self.k_email('');
                            $('#loginModal').modal('hide');
                            $('#login-link').css({display: "none" });
                        } else {
                            alert("Invalid login!");
                            self.k_password('');
                        }
                    },
                    error: function (result) {
                        alert("Invalid login!" + result.responseText);
                        self.k_password('');
                    }
                });
            } else {
                alert('Please check your submission.');
            }
        } else {
            if (self.k_email().length === 0) {
                $('#email-error').css({display: "inline-block" });
            } else {
                $('#email-error').css({display: "none" });
            }
            if (self.k_password().length === 0) {
                $('#password-error').css({display: "inline-block" });
            } else {
                $('#password-error').css({display: "none" });
            }
        }
    };

    self.search = function () {
        var temp = [];
        $.ajax({
            async: false,
            url: '/api/walkers',
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                $.each(data, function (index) {
                    temp.push(new DogWalker(data[index].User, data[index].Pwd, data[index].Phone, data[index].Email, data[index].Postcode));
                });
                self.Walkers(temp);
            },
            error: function () {
                alert("error");
            }
        });
        console.log(self.k_walkers().length);
        self.k_showWalkers(true);
        if (self.k_walkers().length > 0) {         
            self.k_resultsFound(true);
            plotMarkers(self.k_walkers());
        } else {
            //no matching results
            self.k_resultsFound(false);
            infobox.close();
            setAllMap(null);
            gMarkers = [];
            alert("Sorry! No Walkers found near your postcode!");
        }
    };

    // new walker validation and post
    self.submitWalker = function () {
        if (showErrors() === 0) {
            $('span').css({display: "none" });
            console.log(self.k_confirm().length);

            self.createWalker();
            resetLoginTab();
        }
    };

    function resetLoginTab() {
        self.k_new_user('');
        self.k_new_password('');
        self.k_new_email('');
        self.k_new_phone('');
        self.k_new_postcode('');
        self.k_confirm('');
    }

    // error display
    function showErrors() {
        var errors = 0;
        if (self.k_new_user().length < 2) {
            $('#user-error').css({display: "inline-block" });
            errors += 1;
        } else {
            $('#user-error').css({display: "none" });
        }
        if (self.k_new_password().length === 0) {
            $('#new-pwd-error').css({display: "inline-block" });
            errors += 1;
        } else {
            $('#new-pwd-error').css({display: "none" });
        }
        if (self.k_new_phone().length === 0) {
            $('#phone-error').css({display: "inline-block" });
            errors += 1;
        } else {
            $('#phone-error').css({display: "none" });
        }
        // email error not working 
        console.log(self.k_new_email().length);
        if (self.k_new_email().length === 0) {
            $('#email-error').css({display: "inline-block" });
            console.log("IN");
            errors += 1;
        } else {
            $('#email-error').css({display: "none" });
        }
        if (self.k_new_postcode().length === 0) {
            $('#postcode-error').css({display: "inline-block" });
            errors += 1;
        } else {
            $('#postcode-error').css({display: "none" });
        }
        if (!self.isConfirmed()) {
            $('#confirm-error').css({display: "inline-block" });
            errors += 1;
        } else {
            $('#confirm-error').css({display: "none" });
        }
        return errors;
    }

    // post data to server
    self.createWalker = function () {
        var dataToSave = new DogWalker(self.k_new_user(), self.k_new_password(), self.k_new_phone(),
            self.k_new_email(), self.k_new_postcode());
        $.ajax({
            url: "/api/walkers",
            type: "POST",
            data: JSON.stringify(dataToSave),
            processData: false,
            contentType: "application/json",
            dataType: "json",
            success: function (result) {
                alert("Success");
                $('#loginModal').modal('hide');
            },
            error: function (result) {
                alert(result.responseText);
            }
        });
    };

    //Show info window over map marker when walker user is clicked
    self.showDetail = function (walker) {
        for (var i = 0; i < gMarkers.length; i++) {
            if (getDistanceFromLatLonInKm(gMarkers[i].position.lat(), gMarkers[i].position.lng(),
                    walker.lat_long.lat(), walker.lat_long.lng()) <= 0.01) {                
                map.setCenter(gMarkers[i].getPosition());
                infobox.close();
                infobox.setContent(contentString.replace('%user', walker.user).replace('%phone', walker.phone));
                infobox.setOptions(infoBoxOptions);
                infobox.open(map, gMarkers[i]);
            }
        }
    }
}

$(document).ready(function () {
    $('a[data-toggle="tab"]:first').tab('show');
    
    $("#new-phone").mask("(999) 999-9999");
    
    $('#walker-name').popover({
        placement: 'bottom',
        html: 'true',
        content: '<button type="button" class="btn-medium" onclick="">Logout</button>'      
    });

    $('#loginModal').on('hide', function () {
        $('span').css({display: "none" });
        $('#create-tab')[0].reset();
        $('#login-tab')[0].reset();
    });
});

var resultsModel = new ResultsViewModel();
resultsModel.k_query.subscribe(resultsModel.search);
ko.applyBindings(resultsModel);

google.maps.event.addDomListener(window, 'load', initialize);
// Map loading
function initialize() {
    var mapOptions = {
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            map.setCenter(new google.maps.LatLng(position.coords.latitude,
                position.coords.longitude));
        }, function () {
            handleNoGeolocation(true);
        });
    } else {
    // Browser doesn't support Geolocation
        handleNoGeolocation(false);
    }    
}

function plotMarkers() {
    var filtered_walkers = resultsModel.k_walkers();
    setAllMap(null);
    gMarkers.length = 0;
    infobox.close();
    // center map
    geocoder.geocode({'address': resultsModel.k_query()}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
        } else {
            map.setCenter(ottawa);
        }
    });
    google.maps.event.trigger(map, "resize");
    for (var i=0; i < filtered_walkers.length; i++) {
        codeAddress(filtered_walkers[i]);
    }   
}

// Convert postcode to Lat/Long and create marker
function codeAddress(walker) {
    var marker;
    geocoder.geocode({'address': walker.postcode}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
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
            infobox.close();
            infobox.setContent(contentString.replace('%user', walker.user).replace('%phone', walker.phone));
            infobox.setOptions(infoBoxOptions);
            infobox.open(map, marker);
        }
        google.maps.event.addListener(marker, 'click', openInfoWindow);
        gMarkers.push(marker);
    });
}

function setAllMap(map) {
    for (var i = 0; i < gMarkers.length; i++) {
        gMarkers[i].setMap(map);
    }
}