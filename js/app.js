"use strict";

var i;
var map; //holds the map object
var places; //used to store the ko.observable array of the list of places
var markers = []; //stores all the google maps markers
var infowindows = [];

var problem_image = 'https://fearmastery.files.wordpress.com/2013/07/problems-3.jpg';
var loc;
loc = {lat:13.750,lng:100.503};

// model - holds the data 
// apart of what is shown here the model is also enriched with wikipedia image urls
var locations = [
    {name:"Wat Ratchabophit", loc:{lat:13.750122,lng:100.499171},
    show:ko.observable(true), id:"0",wikiurl:ko.observable('')},
    {name:"Giant Swing", loc:{lat:13.752040,lng:100.499600},
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
    show:ko.observable(true), id:"6",wikiurl:ko.observable('')}
];

// utility function which uses the name of each location and fetches img url from wikipedia
// if the image/page exists we get the image (first image in the page)
// otherwise I use a default 'problem-image'
// the function is invoked immediately after it's defined.
// this function is part of the contol(modelview) as it fetches info from wikipedia and updates the // model (locations) with it.
function getwikiurls() {
    var temp;
    var namewithunderscore;
    var surl;
    var surlz;
    
    // we iterate on the locations
    // for each location we compose a wikipedia url with the name of the location 
    // we then call an AJAX to wikipedia to get the image names of the page
    // we then use the image names and ask wikipedia for the URLs in a second AJAX
    locations.forEach(function(element){
        
        //this one is used to return the list of wiki images for each location
        element.imageurls = [];
        namewithunderscore = element.name.split(' ').join('_');
        surl = 'http://en.wikipedia.org/w/api.php?action=' +
        'parse&format=json&prop=images&section=0&page=' + namewithunderscore +
        '&callback=?';
        console.log(surl);
        $.ajax({
            type: "GET",
            url: surl,
            contentType: "application/json; charset=utf-8",
            async: true,
            dataType: "jsonp",
            success: function (data,b,c) {
                if (data.error) {
                    console.log('couldn\'t find this picture in wikipedia ->');
                    element.imageurls.push(problem_image);
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
                            element.imageurls.push(temp);
                            },
                        error: function(errorMessagez) {
                            element.imageurls.push(problem_image);
                        }
                    }); //end of internal json 

                    }

                },
            error: function (errorMessage) {
            console.log('error from wiki api');
            imageurls.push(problem_image);
        }  
    });//end of main ajax
});     
};//end function getwikiurls

getwikiurls();

// the Google Maps init function
// initis the map and add markers
// it also adds infowindows and attaches these info windows to markers
function initMap() {

    // Constructor creates a new map - only center and zoom are required.
    
    map = new google.maps.Map(document.getElementById('map'), {
    center: loc,
    zoom: 15
    });
    
    var marker;
    var markercopy;
    var infowindow;
    
    // adds markers and infowindows based on the data in the model
    //adding a timeout to wait for wikiurl loads to finish
    setTimeout( function setinfos() {
    
    for (i in places()){
        marker = new google.maps.Marker({
        position: places()[i].loc,
        map: map,
        title: places()[i].name
        });
        //console.log(imageurls[i]);
        infowindow = new google.maps.InfoWindow({
            content: '<div>' + places()[i].name + '</div>' +
            "<div><img src='" + locations[i].imageurls[0] + "'style='width:100px' alt='wiki image'></div>",
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
    
    // this function updates the visible markers on the map
    // according to the show parameter in the array (true/false)
    function updateMap() {
        //marker.setVisible(false);
        for (i in markers) {
            markers[i].setVisible(places()[i].show());
        }
    }
    
    // this function is run for filtering the list
    // it is binded to the search input box in the html
    // after filtering it calls the updatemap function also defined in the ViewModel
    this.listFilter = function() {
        for (i in places()) {
            if (places()[i].name.toLowerCase().includes(this.searchTerm().toLowerCase())){
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
    if (document.getElementById('list').style.width === '0px') {
        document.getElementById('list').style.width = '250px';
        document.getElementById('list').style.height = 'auto';
    }
        else {
    	    document.getElementById('list').style.width = '0px';
            document.getElementById('list').style.height = 'auto';
        }
}
