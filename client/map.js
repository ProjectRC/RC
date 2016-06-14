var Firebase = require("firebase");
var myRef= new Firebase("https://progetto-reti.firebaseio.com/");
var luoghi=new Array;
console.log("iniziato");
var i=0;
/*
    myRef.child('offerte')
    .once('value', function(snap){
          console.log("prova1");
  	    snap.forEach(function(childsnap){
  	     console.log("prova2");
  	     var data = childsnap.exportVal();
  	     console.log(data.citta);
  	     luoghi[i]=data.citta;
  	      console.log(luoghi[i]);
  	  
  	     i++;
  	    });
    });
 */

  
  
  
function initMap() {
    myRef.child('offerte')
    .once('value', function(snap){
          console.log("prova1");
  	    snap.forEach(function(childsnap){
  	     console.log("prova2");
  	     var data = childsnap.exportVal();
  	     console.log(data.citta);
  	     luoghi[i]=data.citta;
  	      console.log(luoghi[i]);
  	  
  	     i++;
  	    });
    });
    /*var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 0, lng: 0},
    zoom: 3,
    styles: [{
      featureType: 'poi',
      stylers: [{ visibility: 'off' }]  // Turn off points of interest.
    }, {
      featureType: 'transit.station',
      stylers: [{ visibility: 'off' }]  // Turn off bus stations, train stations, etc.
    }],
    disableDoubleClickZoom: true
  });*/
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 8,
          center: {lat: 41.9027835, lng: 12.4963655}
        });
        var geocoder = new google.maps.Geocoder();
        

        document.getElementById('submit').addEventListener('click', function() {
            for(i=0;i<luoghi.length;i++){
                geocodeAddress(geocoder,map, luoghi[i]);
            }
  	        geocodeAddress(geocoder, map, "roma");
  	        geocodeAddress(geocoder, map, "latina");
  	        geocodeAddress(geocoder, map, "napoli");
  	        geocodeAddress(geocoder, map, "trento");
  	        
  	        
        });
        
      }

function geocodeAddress(geocoder, resultsMap,address) {
        
        //var address = document.getElementById('address').value;
        geocoder.geocode({'address':address }, function(results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            resultsMap.setCenter(results[0].geometry.location);
            
            var contentString = '<div id="content">'+
              '<div id="siteNotice">'+
              '</div>'+
              '<h1 id="firstHeading" class="firstHeading">Mitra</h1>'+
              '<div id="bodyContent">'+
              '<p><b>Job</b></p>'+
              '<p>Attribution: Roma, Link all annuncio : <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">'+
              'https://en.wikipedia.org/w/index.php?title=Uluru</a> '+
              '(last visited June 22, 2009).</p>'+
              '</div>'+
              '</div>';

            var infowindow = new google.maps.InfoWindow({
              content: contentString
            });
            
            var marker = new google.maps.Marker({
              map: resultsMap,
              position: results[0].geometry.location,
              title: 'Work for Andrea'
            });
            
            marker.addListener('click', function() {
              infowindow.open(resultsMap, marker);
            });
            
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
  	     
        
}