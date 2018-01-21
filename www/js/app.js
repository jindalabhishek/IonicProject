// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'todo' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var selectedRating = 0;
angular.module('todo', ['ionic','ngCordova','ionic-ratings']) //adding dependecies 

//default run method provided by ionic platform
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

//map config, sends map.html to front end
.config(function($stateProvider, $urlRouterProvider) {
 
  $stateProvider
  .state('map', {
    url: '/',
    templateUrl: 'templates/map.html',
    controller: 'MapCtrl'
  });
 
  $urlRouterProvider.otherwise("/");
 
})

// //controller(functionality) for google maps
.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, $ionicPopup, $http) {
  $scope.ratingsObject = {
    iconOn: 'ion-ios-star', //Optional
    iconOff: 'ion-ios-star-outline', //Optional
    iconOnColor: 'rgb(200, 200, 100)', //Optional
    iconOffColor: 'rgb(200, 100, 100)', //Optional
    rating: 0, //Optional
    minRating: 0, //Optional
    readOnly: false, //Optional
    callback: function(rating,index) { //Mandatory
      selectedRating=rating;
      // $scope.ratingsCallback(rating,index);
    }
  };
  var latLng;
  $scope.initMap = function() {
    var options = {timeout: 10000, enableHighAccuracy: true}; //timeout
   
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
   
      latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude); //position of User
      console.log(latLng.lat());
      var mapOptions = {
        center: latLng, // settinf center of map to be the user's current location
        zoom: 15, //zoom span
        mapTypeId: google.maps.MapTypeId.ROADMAP //road map, google map type id
      };
   
      $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions); //retrieves div 'map' present in map.html
      google.maps.event.addListenerOnce($scope.map, 'idle', function(){ //adding listener to add marker once the map is fully loaded
     
      var marker = new google.maps.Marker({ //google maps Marker API
          map: $scope.map, //initializing map
          icon: 'http://maps.google.com/mapfiles/ms/micons/green-dot.png',
          animation: google.maps.Animation.DROP,
          position: latLng, //setting position of marker
          title:'Hello!!' //setting lebel for marker, it's visible when u hover on the marker
        });

      });

      google.maps.event.addListener($scope.map, 'click', function(e) {
          $scope.placeMarkerAndPanTo(e.latLng, $scope.map);
        });

    }, function(error){
      console.log("Could not get location"); //error handling
    });
  };

  $scope.placeMarkerAndPanTo = function (latLng, map) {
        var marker = new google.maps.Marker({
          position: latLng,
          map: map
        });
        console.log(latLng.lat());
        map.panTo(latLng);

        /*POST Request
          $http.post('/abc', {username : 'abc'}).then(function (res){
              console.log("yo");
          });
        */
  };

  $scope.ratingsCallback = function(rating, index) {
    console.log('Selected rating is : ', rating, ' and the index is : ', index);
  };
  $scope.showRating = function() {
    selectedRating=0;
    var promptPopup = $ionicPopup.prompt({
    title: 'Rating',
    subTitle: 'Choose 1 to 5',
    templateUrl: 'templates/rating.html'
    });
    promptPopup.then(function() {
      console.log(selectedRating);
    });
  };

  $scope.showComments = function() {
      var promptPopup = $ionicPopup.prompt({
         title: 'Comments',
         template: 'Share your views',
         inputType: 'text',
         inputPlaceholder: 'Write here...'
      });
        
      promptPopup.then(function(res) {
        console.log(res);
        console.log(latLng);
        // POST Request
        var postdata = {
          username: 'deepak',
          lat: latLng.lat(),
          lon: latLng.lng(),
          comment: res
        }
        console.log(postdata)
        $http.post('/postComment', postdata).then(function (res){
            console.log(res);
        });
      
      });
    
   };

});


// .controller('RateCtrl', function($scope, $ionicPopup) {
  

  
// });