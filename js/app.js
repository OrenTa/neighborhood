"use strict";

//model
var Model = function () {
   
    this.locations = [];
    this.locations.push({name:"Phraya Phet Prani",loc:{lat:13.75445,lng:100.505351}});
    this.locations.push({name:"The Giant Swing",loc:{lat:13.752040,lng:100.499600}});
    this.locations.push({name:"Soi Sukha 2",loc:{lat:13.750122,lng:100.499171}});
    this.locations.push({name:"Wat Thep Sirin Thrawat",loc:{lat:13.746287,lng:100.509814}});
    this.locations.push({name:"Bobe Market Bridge",loc:{lat:13.753040,lng:100.518741}});
    this.locations.push({name:"Dragon Temple",loc:{lat:13.7436,lng:100.511874}});
   
};

var MyPlaces = (new Model()).locations;
var temptxt; //used for the search term
var i;
var map; //holds the map object


//ko viewModel
var ViewModel = function () {
    var y = MyPlaces;
    var tempfilter;
    
    this.places = ko.observableArray(y);
    this.filteredPlaces = ko.observableArray();
    this.searchTerm = ko.observable("");//this is the searchTerm
    
    //this.searchhelper =function (loc,tst) {
    //    return loc.includes(tst);
    //}
    
    
    this.listFilter = function() {
        console.clear();
        temptxt = this.searchTerm();
        tempfilter = this.places().filter( function(el){
            return el.name.toLowerCase().includes(temptxt.toLowerCase());  
        });
        // console.log('--search term is --' + temptxt);
        // console.log('--found:' + tempfilter.length + ' items');
        this.filteredPlaces.removeAll();
        for (i in tempfilter) {
            console.log(tempfilter[i].name);
            this.filteredPlaces.push(tempfilter[i]);
            }
        
        //updateMap(this.filteredPlaces);
    }
    
    this.listFilter();
}
    

    
ko.applyBindings(new ViewModel());

// this function is called on 'mobile view' by clicking the hamburger
// the binding is done with knockout in the HTML itself
function showNav() {
    if (document.getElementById('locations').style.width === '0px') {
        document.getElementById('locations').style.width = '250px';
    }
        else {
    	    document.getElementById('locations').style.width = '0px';
        }
}

//inits the map and the markers

var loc;
loc = {lat:13.750,lng:100.503};
var marker;
var markers = [];
var infowindow;
var infos = [];

function initMap() {

    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
    center: loc,
    zoom: 15
    });
    
    var i;
    var markercopy;
    
    // adds markers and infowindows based on the data in the model
    for (i in MyPlaces){
        marker = new google.maps.Marker({
        position: MyPlaces[i].loc,
        map: map,
        title: MyPlaces[i].name
        });
        infowindow = new google.maps.InfoWindow({
            content: '' + MyPlaces[i].name + '-' +
            "<img src='https://www.w3schools.com/html/pic_mountain.jpg' style='width:100px'>",
            maxWidth: '200'
        });    
        markers.push(marker);
        
        // this function is built in a way to deal with function closure
        // as explained in the course
        marker.addListener('click',(function(markercopy, infocopy) {
            return function() {
                infocopy.open(map, markercopy);
                markercopy.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function() {
                    markercopy.setAnimation(null);
                }, 1200);
            };
        })(marker, infowindow));
    }
    
}

function updateMap() {
    marker.setVisible(false);
}
