// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'todo' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var whenConfig = ['$urlRouterProvider', function($urlRouterProvider) {
  console.log("ok");
    $urlRouterProvider
      .when('/login', ['$state', function ($state) {
        console.log("ok");
        if (window.localStorage['isLoggedIn'] == 'true'){
          $state.go('map');
        }
        else
          $state.go('login'); 
    }])
    .when('/signup', ['$state', function ($state) {
        console.log("ok");
        if (window.localStorage['isLoggedIn'] == 'true'){
          $state.go('map');
        }
        else
          $state.go('signup'); 
    }])
    .otherwise('/login');
}];
var stateConfig = ['$stateProvider',function($stateProvider) {
  
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
    cache: true,
    templateUrl: 'templates/comments.html',
    // controller: 'MapCtrl'
  });
 
}];
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
.config(whenConfig)
.config(stateConfig)
//map config, sends map.html to front end
// //controller(functionality) for google maps
.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, $ionicPopup, $http, $ionicLoading, toaster, $compile) {
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
  $scope.user = window.localStorage['username'];
  if(window.localStorage['isLoggedIn']!='true')
    $scope.button = 'Login';
  else
    $scope.button = 'Logout';
  var latLng;
  var newlatLng
  $scope.initMap = function() {
    console.log('yes');
    console.log($scope.user);
    if(window.localStorage['isLoggedIn']=='true')
      toaster.success({title: 'User has successfully logged in.', timeout:1000});

    var options = {timeout: 10000, enableHighAccuracy: true}; //timeout
   
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
   
      latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude); //position of User
      console.log(latLng.lat());
      var mapOptions = {
        center: latLng, // setting center of map to be the user's current location
        zoom: 15, //zoom span
        mapTypeId: google.maps.MapTypeId.ROADMAP, //road map, google map type id
      };
   
      $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions); //retrieves div 'map' present in map.html
      $scope.infowindow = new google.maps.InfoWindow({
        maxWidth:200
      });
      $scope.infowindow.set('isCustomInfoWindow',true);
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

      var currentMarker = new google.maps.Marker({ //google maps Marker API
          map: $scope.map, //initializing map
        });
      $scope.currentMarker = currentMarker;
      });
      $scope.disablePOIInfoWindow();
      console.log($scope.currentRatingObject);
      google.maps.event.addListener($scope.map, 'click', function(e) {
          $scope.currentMarker.setPosition(e.latLng);
          console.log(e);
          newlatLng = e.latLng;
          // $scope.placeMarkerAndPanTo(e.latLng, $scope.map);
          var url = '/getRating?lat='+newlatLng.lat()+'&lon='+newlatLng.lng();
          $http.get(url).then(function (res){
            console.log(res);
            var rateContent="";
            if(!res.data.err && res.data.value!=0){
              rateContent += '<div class="rating">';
              for(i=0; i<5;i++){
                if(i<res.data.value)
                  rateContent += '<span style="font-size:30px;color: #FFD700;">&starf;';
                else
                  rateContent += '<span style="font-size:30px; color: #000000;">&starf;';
              }
              rateContent += '</div>';
            }
            if(e.placeId != undefined){
              $scope.place.getDetails({placeId: e.placeId}, function(result, status) {
                if (status !== google.maps.places.PlacesServiceStatus.OK) {
                  console.error(status);
                  return;
                }
                console.log(result);
                console.log(result.name, result.formatted_address);
                var content = '<div><strong>' + result.name + '</strong>' + rateContent + '<br>' +
                  result.formatted_address + '</div><br><a class="center" href="/#/comments">View Comments</a>';
                $scope.infowindow.setContent(content);
                $scope.infowindow.setPosition(e.latLng);
                $scope.infowindow.open($scope.map, $scope.currentMarker);
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
                    var content ='<div><strong>' + results[0].name + '</strong>' + rateContent +'<br>' +
                    results[0].formatted_address + '</div><br><a class="center" href="/#/comments">View Comments</a>';
                    $scope.infowindow.setContent(content);
                    $scope.infowindow.setPosition(e.latLng);
                    $scope.infowindow.open($scope.map, $scope.currentMarker);
                  }
                }
              });
            }
          });
        });

    }, function(error){
      console.log("Could not get location"); //error handling
    });
  };

  $scope.disablePOIInfoWindow = function(){
    var fnSet = google.maps.InfoWindow.prototype.set;
    google.maps.InfoWindow.prototype.set = function () {
        if(this.get('isCustomInfoWindow')){
          // console.log(arguments);
           fnSet.apply(this, arguments);
         }
    };
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
    if(window.localStorage['username']==undefined){
      toaster.error({title: 'Please Login to Rate', timeout:1500});
      return;
    }
    if(newlatLng == undefined){
        toaster.error({title: 'Please select a location', timeout:1500});
        return;
    }
    selectedRating=0;
    var promptPopup = $ionicPopup.prompt({
    title: 'Rating',
    subTitle: 'Choose 1 to 5',
    templateUrl: 'templates/rating.html'
    });
    promptPopup.then(function(res) {
      if(res=='' && selectedRating == 0){
        toaster.error({title: 'Please rate from 1 to 5', timeout:1500});
        return;
      }
      var postdata = {
          username: window.localStorage['username'],
          lat: newlatLng.lat(),
          lon: newlatLng.lng(),
          rating: selectedRating
        }
        console.log(postdata);
        $http.post('/postRating', postdata).then(function (res){
            console.log(res);
        });
    });
  };

  $scope.saveComments = function() {
      if(window.localStorage['username']==undefined){
        toaster.error({title: 'Please Login to Comment', timeout:1500});
        return;
      }
      if(newlatLng == undefined){
          toaster.error({title: 'Please select a location', timeout:1500});
          return;
      }
      var promptPopup = $ionicPopup.prompt({
         title: 'Comments',
         template: 'Share your views',
         inputType: 'text',
         inputPlaceholder: 'Write here...'
      });
        
      promptPopup.then(function(res) {
        // console
        if(res == undefined)
          return;
        if(res ==''){
          toaster.error({title: 'Please put valid comment', timeout:1500});
          return;
        }
        var postdata = {
          username: window.localStorage['username'],
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
        toaster.error({title: 'Please select a location', timeout:1500});
        $state.go('map');
      }else{
      var url = '/getComments?lat='+newlatLng.lat()+'&lon='+newlatLng.lng();
      $http.get(url).then(function (res){
            var divElement = angular.element(document.querySelector('#comments'));
            console.log(res);
            if(res.data.err=='NO_COMMENT')
              divElement.append('<span class = "item item-input-inset" style="color:red">'+res.data.msg+'</span>');
            else{
              for(var itr in res.data){
                var comment = res.data[itr];
                if(comment=='')
                  divElement.append('<span class = "item item-input-inset" style="color:red">'+res.data.msg+'</span>');
                else
                  divElement.append('<span class = "item item-input-inset" style="color:green">@'+comment.username+': '+comment.text+'</span>');
              }
            }
      });
    }
   };

   // $scope.showRatingForLoc = function() {
   //  // var response;
   //  var url = '/getRating?lat='+newlatLng.lat()+'&lon='+newlatLng.lng();
   //  $http.get(url).then(function (res){
   //    console.log(res.data);
   //    return res.data;
   //  });
   // }

   $scope.logout = function(){
    console.log('lol');
    window.localStorage['isLoggedIn']=false;
    window.localStorage['username']="";
    window.location.reload(true);
    $state.go('login');
   };
   $scope.login = function(){
      console.log($scope.button);
      console.log($scope.user);
      var postdata = {
          username: document.getElementById("username").value,
          password: document.getElementById("password").value
      }
      $http.post('/login', postdata).then(function (res){
        if(res.data.err=='SUCCESS_LOGIN'){
          // $ionicLoading.show({ template: res.data.msg, noBackdrop: true, duration: 500 });
          // toaster.success({title: res.data.msg, timeout:1000});
          window.localStorage['isLoggedIn'] = true;
          window.localStorage['username'] = postdata.username;
          // $scope.initMap();
          window.location.reload(true);
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
        console.log(res);
        if(res.data.err=='USERNAME_TAKEN'){
          toaster.error({title: res.data.msg, timeout:1500});
        }else{
          toaster.success({title: res.data.msg, timeout:1500});
          $state.go('login');
        }
      });
   };

   // $scope.checkSession = function(val) {
   //    console.log(val);
   //    $http.get('/getSession').then(function (res){
   //      console.log(res.data.err);
   //      if(res.data.err == true){
   //        if(val != 'map'){
   //          $state.go('map');
   //        }
   //        else
   //          $scope.initMap();
   //      }
   //      else{
   //        if(val=='register')
   //          $state.go('signup');
   //        else
   //          $state.go('login');
   //      }
   //    });
   // };

});


// .controller('RateCtrl', function($scope, $ionicPopup) {
  

  
// });