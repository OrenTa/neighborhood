// version 1.0 04/06/2017 23:11
"use strict";
/*jshint loopfunc: true */

var i;
var map; //holds the map object
var places; //used to store the ko.observable array of the list of places
var markers = []; //stores all the google maps markers

var PROBLEM_IMAGE = 'https://fearmastery.files.wordpress.com/2013/07/problems-3.jpg';
var loc;
loc = {lat: 13.750, lng: 100.503};

// Model - holds the data 
// apart of what is shown here the model is also enriched later with wikipedia image urls
var locations = [
	{name: 'Wat Ratchabophit', loc: {lat: 13.750122, lng: 100.499171},
		show: ko.observable(true), id: '0', wikiurl: ko.observable('')},
	{name: 'Giant Swing', loc: {lat: 13.752040, lng: 100.499600},
		show: ko.observable(true), id: '1', wikiurl: ko.observable('')},
	{name: 'Wat Thep Sirin Thrawat', loc: {lat: 13.746287, lng: 100.509814},
		show: ko.observable(true), id: '2', wikiurl: ko.observable('')},
	{name: 'Bobe Market Bridge', loc: {lat: 13.753040, lng: 100.518741},
		show: ko.observable(true), id: '3', wikiurl: ko.observable('')},
	{name: 'Wat Mangkon Kamalawat', loc: {lat: 13.7436, lng: 100.511874},
		show: ko.observable(true), id: '4', wikiurl: ko.observable('')},
	{name: 'Wat Bowonniwet Vihara', loc: {lat: 13.75445, lng: 100.505351},
		show: ko.observable(true), id: '5', wikiurl: ko.observable('')},
	{name: 'Wat saket', loc: {lat: 13.760294, lng: 100.499861},
		show: ko.observable(true), id: '6', wikiurl: ko.observable('')},
	{name: 'Thammasat University', loc: {lat: 13.759400, lng: 100.491093},
		show: ko.observable(true), id: '7', wikiurl: ko.observable('')}
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
	this.searchTerm = ko.observable('');//this is the searchTerm
    
	var marker, infowindow;
	
	// Fetches img url from wikipedia based on the locations[].name parameter
	// this function is part of the contol(modelview) as it fetches info from wikipedia and updates the // model (locations) with it.
	// it also sets the infoWindows for Google Maps
	function getData() {
		var namewithunderscore, surl;
		
		locations.forEach(function (element) {
			//this one is used to return the list of wiki image names for each location
			element.imagename = '';
			namewithunderscore = element.name.split(' ').join('_');
			surl = 'https://en.wikipedia.org/w/api.php?action=' +
				'parse&format=json&prop=images&section=0&page=' + namewithunderscore +
				'&callback=?';
			$.ajax({
				url: surl,
				contentType: 'application/json; charset=utf-8',
				dataType: 'jsonp',
				success: function (data, b, c) {
					if (data.error) {
						element.imagename = 'PROBLEM_IMAGE';
					} else {
						element.imagename = data.parse.images[0];
						//console.log('just set one of the imagenames ' + data.parse.images[0]);
					}
				}
			}).then( function(data) {
				if (data.error) {
					element.imagename = 'PROBLEM_IMAGE';
				} else {
					element.imagename = data.parse.images[0];
					console.log('the image name is:' + element.imagename);
					return element.imagename;
				}
			}).then( function(imagename) {
				return $.ajax({
					contentType: 'application/json; charset=utf-8',
					dataType: 'jsonp',
					url: 'https://en.wikipedia.org/w/api.php?action=' + 'query&titles=Image:' + imagename + '&format=json&prop=imageinfo&iiprop=url' + '&callback=something'
				}).then(function(data) {
					if (data.query.pages['-1'].imageinfo) {
						element.imageurl = data.query.pages['-1'].imageinfo['0'].url;
					} else {
						element.imageurl = PROBLEM_IMAGE;
					}
					return element;
				});
			});
		}); // end of forEach
				
	} // end of getDatafunction 
 	
	getData();
	
	var temploc;
	
	// this function loops on locations[] and add the markers to google maps
	// it also adds a click listener for each one to open an infowindow
	// the infowindow content is set according to the marker/location
	var setMarkers = function() {	
		
		 infowindow = new google.maps.InfoWindow({
			 content: '<div>' + 'name goes here' + '</div>' + 
			 '<div><img src="' + 'image url will go here' + '" style="width:100px" alt="wiki image"></div>',
			 maxWidth: '200'
		 });
		
		for (i = 0; i < locations.length; i++) {
			temploc = locations[i];
			marker = new google.maps.Marker({
				position: temploc.loc,
				map: map,
				title: temploc.name
			});
			markers.push(marker);
			marker.addListener('click', infoShow(marker,i));
		} //end creating markers
	};// end function setMarkers()
	
	// this is the click function for the markers - it basically sets the infowindow and opens it
	var infoShow = function (markercopy, icopy ) {
		return function () {
			var tempcont = '<div>' + locations[icopy].name + '</div>' + 
				'<div><img src="' + locations[icopy].imageurl + '" style="width:100px" alt="wiki image"></div>';
			infowindow.setContent(tempcont);
			infowindow.open(map, markercopy);
			markercopy.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function () {
				markercopy.setAnimation(null);
			}, 1200);
		};
	};
	
	setMarkers();

	// this function updates the visible markers on the map
    // according to the show parameter in the array (true/false)
	function updateMap() {
		//marker.setVisible(false);
		for (i = 0; i < markers.length; i++) {
			markers[i].setVisible(places()[i].show());
		}
	}

	// animates the marker and shows its infowindow upon click in the list
	this.locationClicked = function () {
		var tempmarker = markers[parseInt($(this).attr('id'))];
		infoShow(tempmarker,parseInt($(this).attr('id')))();	
		$(this).parent().find('div').css('background-color', 'white');
		$(this).css('background-color', 'orange');
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