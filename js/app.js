"use strict";

//model - holds the data 
var locations = [
    {name:"Phraya Phet Prani", loc:{lat:13.75445,lng:100.505351}, 
    show:ko.observable(true), id:"l1"},
    {name:"The Giant Swing", loc:{lat:13.752040,lng:100.499600},
    show:ko.observable(true), id:"l2"},
    {name:"Soi Sukha 2", loc:{lat:13.750122,lng:100.499171},
    show:ko.observable(true), id:"l3"},
    {name:"Wat Thep Sirin Thrawat",loc:{lat:13.746287,lng:100.509814},
    show:ko.observable(true), id:"l4"},
    {name:"Bobe Market Bridge",loc:{lat:13.753040,lng:100.518741},
    show:ko.observable(true), id:"l5"},
    {name:"Dragon Temple",loc:{lat:13.7436,lng:100.511874},
    show:ko.observable(true), id:"l6"}   
];

var temptxt; //used for the search term
var i;
var map; //holds the map object
var places;
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
    for (i in places()){
        marker = new google.maps.Marker({
        position: places()[i].loc,
        map: map,
        title: places()[i].name
        });
        infowindow = new google.maps.InfoWindow({
            content: '' + places()[i].name + '-' +
            "<img src='https://www.w3schools.com/html/pic_mountain.jpg' style='width:100px'>",
            maxWidth: '200'
        });    
        markers.push(marker);
        
        // this function is built in a way to deal with function closure
        // as explained in the course
        
        marker.addListener('click', infoShow(marker,infowindow));
        
        function infoShow (markercopy, infocopy) {
            return function() {
                infocopy.open(map, markercopy);
                markercopy.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function() {
                    markercopy.setAnimation(null);
                }, 1200);
            };
        }
        
    }
    
}

// jquery
// used to attach event listeners to the list for clicking
$(document).ready(function(){
    
    $("#locationslist").children("div").each(function () {
       $(this).click(function(){
        console.log($(this).attr('id'));
    });
    });
    
   
});

function showinfo(event) {
    console.log(this.target);
}


//ko viewModel
var ViewModel = function () {
    places = ko.observableArray(locations);
    this.searchTerm = ko.observable("");//this is the searchTerm
    
    this.listFilter = function() {
        //console.clear();
        temptxt = this.searchTerm();
        
        //this.filteredPlaces.removeAll();
        for (i in places()) {
            //console.log(this.places()[i].name);
            if (places()[i].name.toLowerCase().includes(temptxt.toLowerCase())){
                places()[i].show(true);
            }
            else {
                places()[i].show(false);
            }
            
            }
        updateMap();
    }//end of filterfunction.
    
    this.listFilter(); //run this one time on initialization.
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



function updateMap() {
    //marker.setVisible(false);
    for (i in markers) {
        markers[i].setVisible(places()[i].show());
    }
}
