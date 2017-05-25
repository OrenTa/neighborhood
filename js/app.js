"use strict";

//model - holds the data 
var locations = [
    {name:"Giant Swing", loc:{lat:13.752040,lng:100.499600},
    show:ko.observable(true), id:"0",wikiurl:ko.observable('')},
    {name:"Wat Ratchabopit SathitMahasimaram", loc:{lat:13.750122,lng:100.499171},
    show:ko.observable(true), id:"1",wikiurl:ko.observable('')},
    {name:"Wat Thep Sirin Thrawat",loc:{lat:13.746287,lng:100.509814},
    show:ko.observable(true), id:"2",wikiurl:ko.observable('')},
    {name:"Bobe Market Bridge",loc:{lat:13.753040,lng:100.518741},
    show:ko.observable(true), id:"3",wikiurl:ko.observable('')},
    {name:"Wat Mangkon Kamalawat",loc:{lat:13.7436,lng:100.511874},
    show:ko.observable(true), id:"4",wikiurl:ko.observable('')},
    {name:"Wat Bowonniwet Vihara", loc:{lat:13.75445,lng:100.505351}, 
    show:ko.observable(true), id:"5",wikiurl:ko.observable('')},
    {name:"Wat saket",loc:{lat:13.760294,lng:100.499861},
    show:ko.observable(true), id:"6",wikiurl:ko.observable('')},
    {name:"Wat saket",loc:{lat:13.760294,lng:100.499861},
    show:ko.observable(true), id:"7",wikiurl:ko.observable('')},
    {name:"Wat saket",loc:{lat:13.760294,lng:100.499861},
    show:ko.observable(true), id:"8",wikiurl:ko.observable('')} 
];

var temptxt; //used for the search term
var i;
var map; //holds the map object
var places;
var marker;
var markers = [];
var infowindow;
var infowindows = [];
var imageurls=[];
//inits the map and the markers

var url;
var surl;
var surlz;
var markup;
var y;
var temp;
var namewithunderscore;
var problem_image = 'https://fearmastery.files.wordpress.com/2013/07/problems-3.jpg';

var loc;
loc = {lat:13.750,lng:100.503};


function getwikiurls() {
    
    for (i in locations){
    //this one is used to return the list of wiki images for each location
    namewithunderscore = locations[i].name.split(' ').join('_');
    surl = 'http://en.wikipedia.org/w/api.php?action=' +
        'parse&format=json&prop=images&section=0&page=' + namewithunderscore +
        '&callback=?';
    //console.log(namewithunderscore);
    //console.log(surl);
    console.log('first ajax called with ' + surl);
    $.ajax({
        type: "GET",
        url: surl,
        contentType: "application/json; charset=utf-8",
        async: true,
        dataType: "jsonp",
        success: function (data,b,c) {
            if (data.error) {
                console.log('AA->');
                console.log(data);
                imageurls.push(problem_image);
                //console.log(data);
            }
            else {
                //per each image get its URL by submitting a second AJAX
                //getting url of the first image in the page.
                surlz = 'http://en.wikipedia.org/w/api.php?action=' +
                'query&titles=Image:' + data.parse.images[0] +
                '&format=json&prop=imageinfo&iiprop=url' +
                '&callback=something';
                //internal json
                $.ajax({
                    type:"GET",
                    url:surlz,
                    contentType:"application/json; charset=utf-8",
                    async: true,
                    dataType: "jsonp",
                    success: function(dataz) {
                        temp= dataz.query.pages["-1"].imageinfo["0"].url
                        console.log(temp);
                        imageurls.push(temp);
                        },
                    error: function(errorMessagez) {
                         //console.log(errorMessagez);
                         console.log('indi');
                        imageurls.push(problem_image);
                    }
                }); //end of internal json
            
                }
        
        },
        error: function (errorMessage) {
            console.log('error from wiki api');
             imageurls.push(problem_image);
        }  
    });//end of main ajax
} // end of for i in locations inside ready function
        
};//end function getwikiurls


getwikiurls();

function initMap() {

    // Constructor creates a new map - only center and zoom are required.
    
    map = new google.maps.Map(document.getElementById('map'), {
    center: loc,
    zoom: 15
    });
    
    var i;
    var markercopy;
    
    // adds markers and infowindows based on the data in the model
    //adding a timeout to wait for wikiurl loads to finish
    setTimeout( function setinfos()
               {
    console.log(imageurls);
    for (i in places()){
        marker = new google.maps.Marker({
        position: places()[i].loc,
        map: map,
        title: places()[i].name
        });
        //console.log(imageurls[i]);
        infowindow = new google.maps.InfoWindow({
            content: '' + places()[i].name + '-' +
            "<img src='" + imageurls[i] + "'style='width:100px' alt='wiki image'>",
            maxWidth: '200'
        });    
        markers.push(marker);
        infowindows.push(infowindow);
        
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
               ,2000);//this is the end of setTimeout
    
}


// jquery
// used to attach event listeners to the list for clicking
// and defines the ui behavior upon this click ... 
// also used to fetch the wikipedia infos
$(document).ready(function(){
    
    $("#locationslist").children("div").each(function() {
       $(this).click(function(){
        for (i in infowindows) {
          infowindows[i].close();  
        }
        infowindows[parseInt($(this).attr('id'))].open(map, markers[parseInt($(this).attr('id'))]);
        $(this).parent().find("div").css("background-color","white");
        $(this).css("background-color","orange");
       })
    });  
    
}); //the ready function


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
