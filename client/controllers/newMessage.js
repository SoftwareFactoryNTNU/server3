angular.module('MyApp')
  .controller('NewMessageCtrl', function($scope, $alert, $auth, $state, Account, $mdDialog, $timeout, $interval, uiGmapGoogleMapApi) {

    if ($state.get('admin.newmessage').data != undefined) {
      $scope.data = $state.get('admin.newmessage').data;
      Account.getSingleCrash({
        crash_id: $state.get('admin.newmessage').data
      }).success(function(response) {
        console.log(response);
        drawTheAmazingMap(response);
      }).catch(function(err) {
        showPopup('Could not get crash data', err.data.message, function() {
        })
      })
    } else {
      $state.go('admin.messages');
    }

    $scope.sendResponse = function() {
      Account.sendResponse({
        message: $scope.data.response_message,
        measures_taken: $scope.data.response_measures_taken,
        ruh_id: $scope.data.ruh._id
      }).success(function(response) {
        showPopup('Response sent!', 'The sender will be notified.', function() {
          $state.go('admin.messages');
        })
      }).catch(function(err) {
        showPopup('Error!', err.data.message, function() {

        })
      })
    };

    $scope.respond = function() {
      $scope.data.respond = !$scope.data.respond;
    };

    $scope.unixToString = function(unixNumber) {
      var date = new Date(unixNumber * 1000);
      var minutes = date.getMinutes();if (minutes < 10) {minutes = '0' + minutes;}
      var hours = date.getHours();if (hours < 10) {hours = '0' + hours;}
      var days = date.getDate();if (days < 10) {days = '0' + days;}
      var month = date.getMonth() + 1;if (month < 10) {month = '0' + month;}
      var year = date.getFullYear();if (year < 10) {year = '0' + year;}

      return [days + '-' + month + '-' + year,hours + ':' + minutes];
    };

    function showPopup(title, message, cb) {
      var alert = $mdDialog.alert()
        .parent(angular.element(document.querySelector('#popupContainer')))
        .clickOutsideToClose(true)
        .title(title)
        .content(message)
        .ariaLabel('Alert Dialog Demo')
        .ok('I understand');
      $mdDialog.show(alert).then(cb);
    };

    //                            MAP
    // *********************************************************************
    // // ------------------------------------------------------------------
    /*
            ___                          _             __  ___
           /   |  ____ ___  ____ _____  (_)___  ____ _/  |/  /___ _____
          / /| | / __ `__ \/ __ `/_  / / / __ \/ __ `/ /|_/ / __ `/ __ \
         / ___ |/ / / / / / /_/ / / /_/ / / / / /_/ / /  / / /_/ / /_/ /
        /_/  |_/_/ /_/ /_/\__,_/ /___/_/_/ /_/\__, /_/  /_/\__,_/ .___/
                                             /____/            /_/

     -----------------------------------------------------------------------
    */


  console.log("hello");
  var cords = [[63.568138,10.295417],[63.314919,10.752056],[63.108749,11.5345],[63.086418,11.648694],[63.827442,10.371333],[62.961193,10.090278],[62.743168,9.291194],[63.122833,10.591667],[63.123749,9.443389],[63.210278,10.70875],[63.016499,10.958944],[63.163502,10.526361],[62.112194,11.48656],[63.019974,9.197861],[63.328529,11.027583],[63.390305,11.418528],[63.141998,11.722361],[63.147141,9.11575],[62.876141,9.661972],[62.821918,10.608694],[62.7085,9.800861],[62.412193,11.18656],[62.550045646,12.050345356]];
  $scope.map_coordinates = cords;
  var speedArray = [55, 48, 49, 50, 50, 51, 48, 50, 50, 48, 51, 52, 54, 55, 55, 55, 56, 56, 55, 54, 57, 55, 54, 55, 54, 56, 56, 56, 56, 54, 56, 56, 54, 56, 55, 54, 56, 56, 54];




  function drawTheAmazingMap(crashData) {
    // draw the map!
    cords = [];
    for (var i=0;i<crashData.data.length;i++) {
      cords[i] = [ crashData.data[i].latitude, crashData.data[i].longditude ]
    }
    // console.log("new cords!");
    // console.log(cords);
    $scope.map_coordinates = cords;

    $scope.drawNewPoly();
    $scope.animateCar($scope.map.markers[0], cords, 50);
  }

  $scope.map = {
        center: {latitude: $scope.map_coordinates[0][0],longitude: $scope.map_coordinates[0][1]},
        zoom: 11,
        draggable: true,
        disableDoubleClickZoom: true,
        scrollwheel: false,
        panControl: true,
        markers: [{
          id: '123',
          latitude: $scope.map_coordinates[0][0],
          longitude: $scope.map_coordinates[0][1]
        }]
    };



      uiGmapGoogleMapApi.then(function(maps) {
        console.log("uiGmapGoogleMapApi has been loaded")
        var myLatLng = [];

        $scope.drawNewPoly = function() {
          for (var i = 0; i < cords.length; i++) {
                myLatLng.push(new google.maps.LatLng({lat: cords[i][0], lng: cords[i][1]}));
          }

          $scope.polylines = [
                  {
                      id: 1,
                      path: myLatLng,
                      editable: false,
                      draggable: false,
                      geodesic: true,
                      visible: true,
                      stroke: {
                          color: '#6060FB',
                          weight: 3
                      },
                      visible: true,
                  }
              ];
        }

        $scope.updateInfo = function(){
          //console.log("!");
          // // the future is here in this method
        }


        $scope.animateCar = function(marker, cords, km_h){
          var target = 1;
          var km_h = speedArray[target];
          var delay = 100;
          //cords.push([startPos[0], startPos[1]]);
          //console.log(cords);
          $scope.goTo = function(){
            //var lat = marker.position.lat();
            //var lng = marker.position.lng();
            var lat = $scope.map.markers[0].latitude;
            var lng = $scope.map.markers[0].longitude;
            // console.log(lat);
            // console.log(lng);

            var step = (km_h * 1000 * delay) / 3600000
            $scope.updateInfo();
            var dest = new google.maps.LatLng(cords[target][0], cords[target][1]);
            var start = new google.maps.LatLng(cords[target-1][0], cords[target-1][1]);
            var distance = google.maps.geometry.spherical.computeDistanceBetween(
              dest, start); //in meters
              var numStep = distance / step;
              var i = 0;
              var deltaLat = (cords[target][0] - lat) / numStep;
              var deltaLng = (cords[target][1] - lng) / numStep;
              $scope.moveMarker = function(){
                lat += deltaLat;
                lng += deltaLng;
                i += step;
                if (i<distance){
                  //marker.setPosition(new google.maps.LatLng(lat, lng));
                  $scope.map.markers[0].latitude = lat;
                  $scope.map.markers[0].longitude = lng;

                  first = $timeout($scope.moveMarker, delay); //setTimeout(moveMarker, delay); - $timeout is setTimeout in angular
                }
                else{
                  //$scope.map.markers[0].setPosition(dest); //easy method depricated because fuu
                  $scope.map.markers[0].latitude = cords[target][0];
                  $scope.map.markers[0].longitude = cords[target][1];
                  target += 1;
                  km_h = speedArray[target];
                  //updateInfo();
                  if (target == cords.length){
                    target = 1;
                    km_h = speedArray[0];
                    $scope.updateInfo();
                  }
                  secound = $timeout($scope.goTo, delay);//setTimeout(goTo, delay);
                }
              }
              $scope.moveMarker();
          }
          $scope.goTo();
        }

        /**
         * methods for recentering the map (need to bee done periodicaly and after 1 sec(this seems to work(shit))) *
         **/
        $timeout(function(){
          $scope.map.center = {latitude: $scope.map.markers[0].latitude, longitude: $scope.map.markers[0].longitude};
        }, 1000);
        $interval( function(){
          $scope.map.center = {latitude: $scope.map.markers[0].latitude, longitude: $scope.map.markers[0].longitude};
        }, 5000);

        //TESTS for geometry library
        /*
        var start = new google.maps.LatLng(cords[0][0], cords[0][1]);
        var dest = new google.maps.LatLng(cords[1][0], cords[1][1]);
        var distance = google.maps.geometry.spherical.computeDistanceBetween(
          start, dest); //in meters
          console.log(distance);
        */
   });

   //                           END - MAP
   // *********************************************************************
   // // ******************************************************************


});
