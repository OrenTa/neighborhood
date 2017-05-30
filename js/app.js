"use strict";
/*jshint loopfunc: true */

var i;
var map; //holds the map object
var places; //used to store the ko.observable array of the list of places
var markers = []; //stores all the google maps markers
var infowindows = [];

var PROBLEM_IMAGE = 'https://fearmastery.files.wordpress.com/2013/07/problems-3.jpg';
var loc;
loc = {lat: 13.750, lng: 100.503};

// Model - holds the data 
// apart of what is shown here the model is also enriched later with wikipedia image urls
var locations = [
    {name: "Wat Ratchabophit", loc: {lat: 13.750122, lng: 100.499171},
        show: ko.observable(true), id: "0", wikiurl: ko.observable('')},
    {name: "Giant Swing", loc: {lat: 13.752040, lng: 100.499600},
        show: ko.observable(true), id: "1", wikiurl: ko.observable('')},
    {name: "Wat Thep Sirin Thrawat", loc: {lat: 13.746287, lng: 100.509814},
        show: ko.observable(true), id: "2", wikiurl: ko.observable('')},
    {name: "Bobe Market Bridge", loc: {lat: 13.753040, lng: 100.518741},
        show: ko.observable(true), id: "3", wikiurl: ko.observable('')},
    {name: "Wat Mangkon Kamalawat", loc: {lat: 13.7436, lng: 100.511874},
        show: ko.observable(true), id: "4", wikiurl: ko.observable('')},
    {name: "Wat Bowonniwet Vihara", loc: {lat: 13.75445, lng: 100.505351},
        show: ko.observable(true), id: "5", wikiurl: ko.observable('')},
    {name: "Wat saket", loc: {lat: 13.760294, lng: 100.499861},
        show: ko.observable(true), id: "6", wikiurl: ko.observable('')}
];

// Google Maps init function
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: loc,
        zoom: 15
    });
	console.log(google);
	ko.applyBindings(new ViewModel());
}

// KO viewModel
// Adds to the map markers and infowindows and attaches these info windows to markers
var ViewModel = function () {
    places = ko.observableArray(locations);
    this.searchTerm = ko.observable("");//this is the searchTerm
    
    var marker, infowindow;
	var imgRequests = [];
	var urlRequests = [];
	
	// Fetches img url from wikipedia based on the locations[].name parameter
	// this function is part of the contol(modelview) as it fetches info from wikipedia and updates the // model (locations) with it.
	function getWikiNames() {
		var temp, namewithunderscore, surl;
		
		locations.forEach(function (element) {
			//this one is used to return the list of wiki image names for each location
			element.imagename = '';
			namewithunderscore = element.name.split(' ').join('_');
			surl = 'https://en.wikipedia.org/w/api.php?action=' +
				'parse&format=json&prop=images&section=0&page=' + namewithunderscore +
				'&callback=?';
			imgRequests.push($.ajax({
				type: "GET",
				url: surl,
				contentType: "application/json; charset=utf-8",
				async: true,
				dataType: "jsonp",
				success: function (data, b, c) {
					if (data.error) {
						element.imagename = 'PROBLEM_IMAGE';
					} else {
						element.imagename = data.parse.images[0];
						console.log('set one of the imagenames ' + data.parse.images[0]);
					}
				}
			}));
		});
	}//end function getiwkienames
	
	function getWikiUrls() {
		var surlz;
		console.log('getWikiUrls starting and the image name of element[1] is ' + locations[1].imagename);
		locations.forEach(function (element) {
			element.imageurl = '';
			surlz = 'https://en.wikipedia.org/w/api.php?action=' +
				'query&titles=Image:' + element.imagname +
				'&format=json&prop=imageinfo&iiprop=url' +
				'&callback=something';
			urlRequests.push($.ajax({
				type: "GET",
				url: surlz,
				contentType: "application/json; charset=utf-8",
				async: true,
				dataType: "jsonp",
				success: function (dataz) {
					if (dataz.query.pages["-1"].imageinfo) {
						element.imageurl = dataz.query.pages["-1"].imageinfo["0"].url;
					} else {
						element.imageurl = PROBLEM_IMAGE;
					}
				},
				error: function (errorMessagez) {
					element.imageurl = PROBLEM_IMAGE;
				}
			}));
		});
	}		
	
	// adds markers and infowindows based on the data in the model
    //adding a timeout to wait for wikiurl loads to finish
	function setinfos() {
		console.log('setinfos starting');
		for (i = 0; i < places().length; i++) {
			marker = new google.maps.Marker({
				position: places()[i].loc,
				map: map,
				title: places()[i].name
			});
            //console.log(imageurls[i]);
			infowindow = new google.maps.InfoWindow({
				content: '<div>' + places()[i].name + '</div>' +
                    "<div><img src='" + locations[i].imageurl + "'style='width:100px' alt='wiki image'></div>",
                maxWidth: '200'
			});
            markers.push(marker);
            infowindows.push(infowindow);
        
            var infoShow = function (markercopy, infocopy) {
                    return function () {
                        infocopy.open(map, markercopy);
                        markercopy.setAnimation(google.maps.Animation.BOUNCE);
                        setTimeout(function () {
                            markercopy.setAnimation(null);
                        }, 1200);
                    };
                };
            
            marker.addListener('click', infoShow(marker, infowindow));
        }
    }
	
	getWikiNames(); 
	$.when.apply($, imgRequests).then(getWikiUrls()); 
	$.when.apply($, urlRequests).then(setinfos()); 
           
    // this function updates the visible markers on the map
    // according to the show parameter in the array (true/false)
    function updateMap() {
        //marker.setVisible(false);
        for (i = 0; i < markers.length; i++) {
            markers[i].setVisible(places()[i].show());
        }
    }
    
    this.locationClicked = function () {
        var tempmarker = markers[parseInt($(this).attr('id'))];
		if (infowindows[4]) {
            for (i = 0; i < infowindows.length; i++) {
                infowindows[i].close();
            }
            infowindows[parseInt($(this).attr('id'))].open(map, tempmarker);
			tempmarker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function () {
				tempmarker.setAnimation(null);
			}, 1200);
			
        }
        
		$(this).parent().find("div").css("background-color", "white");
        $(this).css("background-color", "orange");
    };
    
    // this function is run for filtering the list
    // it is binded to the search input box in the html
    // after filtering it calls the updatemap function also defined in the ViewModel
    this.listFilter = function () {
        for (i = 0; i < places().length; i++) {
            if (places()[i].name.toLowerCase().includes(this.searchTerm().toLowerCase())) {
                places()[i].show(true);
            } else {
                places()[i].show(false);
            }
        }
        updateMap();
    };//end of filterfunction.
    
    this.listFilter(); //run this one time on initialization.
}; // end of viewmode function

// Shows or hides the side navigation in 'mobile view' 
// the binding is done with knockout in the HTML itself to the 'hamburger'
function showNav() {
    if (document.getElementById('list').style.width === '0px') {
        document.getElementById('list').style.width = '250px';
        document.getElementById('list').style.height = 'auto';
    } else {
        //console.log('width is not 0px but ' + document.getElementById('list').style.width)
        document.getElementById('list').style.width = '0px';
        document.getElementById('list').style.height = 'auto';
    }
}

function googleError() {
	window.alert('Error while loading Google Maps');
}