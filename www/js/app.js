// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'todo' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var selectedRating = 0;
angular.module('todo', ['ionic','ngCordova','ionic-ratings', 'toaster']) //adding dependecies 

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
.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
 
$urlRouterProvider.when(/((\/login)|(\/signup))/, function(){
        console.log(window.localStorage);
        console.log('isme aaya')
        if (window.localStorage['isLoggedIn'] == 'true'){
            return '/map'
        }
  })
  
  $stateProvider
  .state('login', {
    url:'/login',
    cache: false,
    templateUrl: 'templates/login.html'
  });

  $stateProvider
  .state('signup', {
    url: '/signup',
    cache: false,
    templateUrl: 'templates/register.html',
    // controller: 'MapCtrl'
  });

  $stateProvider
  .state('map', {
    url: '/map',
    cache: true,
    // abstract: true,
    templateUrl: 'templates/map.html',
    // controller: 'MapCtrl'
  });

  $stateProvider
  .state('comments', {
    url: '/comments',
    cache: false,
    templateUrl: 'templates/comments.html',
    // controller: 'MapCtrl'
  });


 
  $urlRouterProvider.otherwise("/login");
   
  // $state.go($state.current, {}, {reload: true});
 
})

// //controller(functionality) for google maps
.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, $ionicPopup, $http, $ionicLoading, toaster) {
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
  var newlatLng;
  $scope.initMap = function() {
    console.log('yes');
    var options = {timeout: 10000, enableHighAccuracy: true}; //timeout
   
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
   
      latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude); //position of User
      console.log(latLng.lat());
      var mapOptions = {
        center: latLng, // setting center of map to be the user's current location
        zoom: 15, //zoom span
        mapTypeId: google.maps.MapTypeId.ROADMAP //road map, google map type id
      };
   
      $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions); //retrieves div 'map' present in map.html
      // google.maps.event.trigger($scope.map, "resize");
      // $scope.map.setZoom(15);
      $scope.infowindow = new google.maps.InfoWindow({
        maxWidth:200
      });
      $scope.geocoder = new google.maps.Geocoder();
      $scope.place = new google.maps.places.PlacesService($scope.map);
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
          console.log(e);
          newlatLng = e.latLng;
          $scope.placeMarkerAndPanTo(e.latLng, $scope.map);
          if(e.placeId != undefined){
            $scope.place.getDetails({placeId: e.placeId}, function(result, status) {
              if (status !== google.maps.places.PlacesServiceStatus.OK) {
                console.error(status);
                return;
              }
              console.log(result.name, result.formatted_address);
              $scope.infowindow.setContent('<div><strong>' + result.name + '</strong><br>' +
                  result.formatted_address + '</div><br><a class="center" href="/#/comments">View Comments</a>');
              $scope.infowindow.setPosition(e.latLng);
              $scope.infowindow.open($scope.map);
            });
          }
          else{
            $scope.geocoder.geocode({
              'latLng': e.latLng
            }, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                  if(results[0].name == undefined)
                    results[0].name = 'Unnamed';
                  $scope.infowindow.setContent('<div><strong>' + results[0].name + '</strong><br>' +
                  results[0].formatted_address + '</div><br><a class="center" href="/#/comments">View Comments</a>');
                  $scope.infowindow.setPosition(e.latLng);
                  $scope.infowindow.open($scope.map);
                }
              }
            });
          }
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

  $scope.saveComments = function() {
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
          username: 'rhokmot',
          lat: newlatLng.lat(),
          lon: newlatLng.lng(),
          comment: res
        }
        console.log(postdata);
        $http.post('/postComment', postdata).then(function (res){
            console.log(res);
        });
      
      });
    
   };

   $scope.showComments = function() {

      console.log('call');
      if(newlatLng == undefined){
        toaster.error({title: 'Please select a location', timeout:1000});
        $state.go('map');
      }else{
      var url = '/getComments?lat='+newlatLng.lat()+'&lon='+newlatLng.lng();
      $http.get(url).then(function (res){
            console.log(res);
            var temp=res.data[0].comments[0].text;
            var divElement = angular.element(document.querySelector('#comments'));
            divElement.append("<p>hi</p>")
      });
    }
   };

   $scope.login = function(){
      var postdata = {
          username: document.getElementById("username").value,
          password: document.getElementById("password").value
      }
      $http.post('/login', postdata).then(function (res){
        if(res.data.err=='SUCCESS_LOGIN'){
          // $ionicLoading.show({ template: res.data.msg, noBackdrop: true, duration: 500 });
          $scope.user = document.getElementById("username").value;
          toaster.success({title: res.data.msg, timeout:1000});
          window.localStorage['isLoggedIn'] = true;
          window.localStorage['username'] = postdata.username;
          // $scope.initMap();
          $state.go('map');
        }
        else{
          toaster.error({title: res.data.msg, timeout:1500});
        }
      });
   }
   $scope.registerUser = function() {
      var postdata = {
          username: document.getElementById("rusername").value,
          password: document.getElementById("rpassword").value
      }
      $http.post('/registerUser', postdata).then(function (res){
        if(res.data.err=='USERNAME_TAKEN'){
          toaster.error({title: res.data.msg, timeout:1500});
        }
      });
   };

   $scope.checkSession = function(val) {
      console.log(val);
      $http.get('/getSession').then(function (res){
        console.log(res.data.err);
        if(res.data.err == true){
          if(val != 'map'){
            $state.go('map');
          }
          else
            $scope.initMap();
        }
        else{
          if(val=='register')
            $state.go('signup');
          else
            $state.go('login');
        }
      });
   };

});


// .controller('RateCtrl', function($scope, $ionicPopup) {
  

  
// });