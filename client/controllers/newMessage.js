angular.module('MyApp')
  .controller('NewMessageCtrl', function($scope, $alert, $auth, $state, Account, $mdDialog, $timeout, $interval, uiGmapGoogleMapApi, Note, $mdMedia) {

    $scope.weather = "Maby snowy or foggy or dry"
    if ($state.get('admin.newmessage').data != undefined) {
      $scope.data = $state.get('admin.newmessage').data;
      Account.getSingleCrash({
        crash_id: $state.get('admin.newmessage').data
      }).success(function(response) {
        console.log(response)
        console.log("---------------------")
        //weatherCrash = response.crash.weather;
        $scope.weather = response.crash.weather;
        $scope.weather.from = new Date(Date.parse($scope.weather.from));

        if(!$scope.$$phase) {
          //$digest or $apply
          $scope.$apply(function() {
              $scope.weather = response.crash.weather;
          });
        }
        $scope.data = processVechicleData(response.data, 'Speed / mph', 'Pedal position');
        $scope.crash = response.crash;
        console.log($scope.crash.crash_sensors);
        console.log($scope.crash._id);
        $scope.refreshNotes();
        drawTheAmazingMap(response);
      }).catch(function(err) {
        showPopup('Could not get crash data', err.data.message, function() {
        })
      })
    } else {
      $state.go('admin.messages');
    }

    Account.getProfile().success(function(response) {
      console.log(response);
      $scope.personalData = response;
    }).catch(function(err) {
      console.log(err);
    })

    function processVechicleData(datapoints, pi_name1, pi_name2) {
      console.log(datapoints);
      var data = [];
      var obj1 = {
        key: pi_name1,
        values: []
      };
      var obj2 = {
        key: pi_name2,
        values: []
      };
      for (i = 0; i < datapoints.length; i++) {
        var tempobject1 = {
          series: 0,
          x: datapoints[i].timestamp,
          y: datapoints[i].vehicle_speed
        };
        var tempobject2 = {
          series: 1,
          x: datapoints[i].timestamp,
          y: datapoints[i].accelerator_pedal_position
        };
        obj1.values.push(tempobject1);
        obj2.values.push(tempobject2);
      }
      data.push(obj1);
      data.push(obj2);
      console.log(data);
      return data;
    }

    $scope.getWeatherOfCrash = function() {
      return weatherCrash;
    }



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


    //                            NOTES
    // *********************************************************************

    function showAlert(content, duration) {
      $alert({
        content: content,
        animation: 'fadeZoomFadeDown',
        type: 'material',
        duration: duration
      });
    }
    $scope.isOpen = false;
      $scope.demo = {
        isOpen: false,
        count: 0,
        selectedDirection: 'right'
      };

    var originatorEv;

    $scope.openMenu = function($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);

    };


    $scope.toggleNotifications = function() {
      $scope.notificationsEnabled = !this.notificationsEnabled;
    };


        $scope.changeNote = function(ev, item) {
          // Appending dialog to document.body to cover sidenav in docs app
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
          var confirm = $mdDialog.prompt()
                .title('Recompose your note')
                .textContent('Edit your note on the accident')
                .placeholder('no it was realy just a lie')
                .ariaLabel('note edit')
                .targetEvent(ev)
                .parent( angular.element(document.body))
                .fullscreen(useFullScreen)
                .clickOutsideToClose(true)
                .ok('Okay!')
                .cancel('No nothing new');
          $mdDialog.show(confirm).then(function(result) {
            //user wanted to change
            console.log("EDIT!");
            item.txt = result;
            $scope.edNote(item);
            //$scope.notes_for.splice($scope.notes_for.indexOf(item), 1);
            //$scope.status = 'You decided to name your dog ' + result + '.';
          }, function() {
            //$scope.status = 'You didn\'t name your dog.';
          });
        };

        $scope.showConfirm = function(ev, item) {
          // Appending dialog to document.body to cover sidenav in docs app
          var confirm = $mdDialog.confirm()
                .title('Would you like to delete this note?')
                .textContent('Remember when it is removed it is never comming back.')
                .ariaLabel('Still sure?')
                .targetEvent(ev)
                .ok('Please do it!')
                .cancel('No no never');
          $mdDialog.show(confirm).then(function() {
            console.log("yes remove the message");
            $scope.deleteNote(item);
            $scope.notes_for.splice($scope.notes_for.indexOf(item), 1);
            $scope.status = 'You decided to get rid of your debt.';
          }, function() {
            $scope.status = 'You decided to keep your debt.';
          });
        };

        console.log("test");

        $scope.notes_for = [];
        $scope.noteData = {};

        $scope.refreshNotes =function(){
          Note.getNote()
           .then(function(response) {
             console.log(response);
             console.log(response.data[0].crash_id);
             //$scope.noteData = response.data;
             $scope.notes_for = [];
             $scope.noteData = {};
             for (var i=0;i<response.data.length;i++){
                 if ($scope.crash._id==response.data[i].crash_id){
                    $scope.notes_for.push(response.data[i])
                 }

             }
             //$scope.$$phase || $scope.$apply();
             //$scope.$apply();   //$digest already in progress uhhh...
             $timeout(function() {
               $scope.$apply();
             });
             console.log($scope.notes_for);
           })
           .catch(function(response) {
             showAlert('Could not load note data..')
           })
         }


         $scope.edNote = function(noteData) {
           //var noteData = $scope.noteData.note;
           console.log(noteData);
           Note.editNote(noteData)
           .then(function(response) {
             showAlert('Note has been edited', 4);
             $timeout(function() {
               $scope.$apply();
             });
           }) .catch(function(response) {
             console.log(response);
             showAlert('Something went wrong! Please try again.', 4);
           });
         };


        $scope.deleteNote = function(noteData) {
          //var noteData = $scope.noteData.note;
          console.log(noteData);
          Note.deleteNote(noteData)
          .then(function(response) {
            showAlert('Note has been deleted', 4);
            $timeout(function() {
              $scope.$apply();
            });
          }) .catch(function(response) {
            console.log(response);
            showAlert('Something went wrong! Please try again.', 4);
          });
        };

        $scope.getPerson = function(pnumber) {
          if (pnumber==$scope.personalData._id){
            return $scope.personalData.email
          } else {
            console.log("error")
          }
        }

        $scope.getTimeMongo = function(_id){
          timestamp = _id.toString().substring(0,8);
          return (new Date( parseInt( timestamp, 16 ) * 1000 )).toDateString();
        }

         //console.log(crash.notes);

         // How to add a note to a spesific crash
         $scope.updateNote = function(noteData) {
           //var noteData = $scope.noteData.note;
           var noteData = {
             crash_id: $scope.crash._id,
             txt: noteData.txt
           };
           console.log(noteData);
           Note.updateNote(noteData)
           .then(function(response) {
             showAlert('Note has been added', 4);

             $scope.noteData = {};
             $scope.refreshNotes();
             console.log($scope.notes_for);
           }) .catch(function(response) {
             console.log(response);
             showAlert('Something went wrong! Please try again.', 4);
           })
         };



    $scope.isActive;
    //                         END - NOTES
    // ---------------------------------------------------------------------



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
  $scope.initializeMap = true;
  console.log("hello");
  var cords = [[63.568138,10.295417],[63.314919,10.752056],[63.108749,11.5345],[63.086418,11.648694],[63.827442,10.371333],[62.961193,10.090278],[62.743168,9.291194],[63.122833,10.591667],[63.123749,9.443389],[63.210278,10.70875],[63.016499,10.958944],[63.163502,10.526361],[62.112194,11.48656],[63.019974,9.197861],[63.328529,11.027583],[63.390305,11.418528],[63.141998,11.722361],[63.147141,9.11575],[62.876141,9.661972],[62.821918,10.608694],[62.7085,9.800861],[62.412193,11.18656],[62.550045646,12.050345356]];
  $scope.map_coordinates = cords;
  $scope.speedArray = [55, 48, 49, 50, 50, 51, 48, 50, 50, 48, 51, 52, 54, 55, 55, 55, 56, 56, 55, 54, 57, 55, 54, 55, 54, 56, 56, 56, 56, 54, 56, 56, 54, 56, 55, 54, 56, 56, 54];

  function drawTheAmazingMap(crashData) {
    // draw the map!
    cords = [];
    speedArray = [];
    for (var i=0;i<crashData.data.length;i++) {
      cords[i] = [ crashData.data[i].latitude, crashData.data[i].longditude ]
      speedArray[i] = crashData.data[i].vehicle_speed
    }
     console.log("new cords!");
     console.log(cords);
     console.log(speedArray);
    $scope.map_coordinates = cords;


    $timeout($scope.animateCar($scope.map.markers[0], cords, 50), 1000);
  }

      uiGmapGoogleMapApi.then(function(maps) {
        var shape = {
          coords: [1, 1, 1, 20, 18, 20, 18, 1],
          type: 'poly'
        };
        $scope.map = {
              center: {latitude: $scope.map_coordinates[0][0],longitude: $scope.map_coordinates[0][1]},
              zoom: 17,
              draggable: true,
              disableDoubleClickZoom: true,
              scrollwheel: false,
              panControl: true,
              markers: [{
                id: '123',
                latitude: $scope.map_coordinates[0][0],
                longitude: $scope.map_coordinates[0][1]
              },
              {
                id: '199',
                latitude: $scope.map_coordinates[$scope.map_coordinates.length-1][0],
                longitude: $scope.map_coordinates[$scope.map_coordinates.length-1][1],
                icon:'//developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'

              }]
          };

/*
          var mar = new google.maps.Marker({
                id: '888',
                position: new google.maps.LatLng($scope.map_coordinates[$scope.map_coordinates.length-1][0], $scope.map_coordinates[$scope.map_coordinates.length-1][1]),
                map: $scope.map,
                animation: google.maps.Animation.DROP,
                title: "booom"
            });
          $scope.markers.push(mar
*/


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
        $timeout($scope.drawNewPoly, 400)
        //$scope.drawNewPoly();
        $scope.updateInfo = function(){
          //console.log("!");
          // // the future is here - in this method
          getSpeed();
        }
        var target = 1;
        $scope.km_h = 0;
        $scope.animateCar = function(marker, cords, km_h){
          console.log("this is the cords!!!")
          console.log(cords)

          $scope.km_h = speedArray[target];
          var delay = 100;//100;
          //cords.push([startPos[0], startPos[1]]);
          //console.log(cords);
          $scope.goTo = function(){
            var lat = $scope.map.markers[0].latitude;
            var lng = $scope.map.markers[0].longitude;

            var step = (($scope.km_h * 1000 * delay) / 3600000) + 1; // pga feil i fart er det + *100
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

                  var first = $interval($scope.moveMarker, delay, 1); //setTimeout(moveMarker, delay); - $timeout is setTimeout in angular
                }
                else{
                  //$scope.map.markers[0].setPosition(dest); //easy method depricated because fuu
                  $scope.map.markers[0].latitude = cords[target][0];
                  $scope.map.markers[0].longitude = cords[target][1];
                  target += 1;
                  $scope.km_h = speedArray[target];
                  //console.log(speedArray.length - target)
                  //console.log(cords.length - target)
                  //console.log(km_h);
                  if(!$scope.$$phase) {
                    //$digest or $apply
                    $scope.$apply();
                  }
                  //updateInfo();
                  if (target == cords.length){
                    target = 1;
                    $scope.km_h = speedArray[target];
                    $scope.updateInfo();
                  }
                  var secound = $interval($scope.goTo, delay, 1);//setTimeout(goTo, delay);
                }
              }
              $scope.moveMarker();
          }
          $scope.goTo();
        }

        $scope.currentSpeed = 0;
        function getSpeed()  {
          if(!$scope.$$phase) {
            //$digest or $apply
            $scope.$apply(function() {
                $scope.km_h = speedArray[target];
            });
          }
        }

        $scope.restartAnimation = function() {
          target = 1;
          console.log("try to restart map")
        }

        /**
         * methods for recentering the map (need to bee done periodicaly and after 1 sec(this seems to work(shit))) *
         **/
           $timeout(function(){
            if (centerMap==true){$scope.map.center = {latitude: $scope.map.markers[0].latitude, longitude: $scope.map.markers[0].longitude};  }
            $scope.map.markers[1].latitude = cords[cords.length-1][0];
            $scope.map.markers[1].longitude = cords[cords.length-1][1];
              $scope.initializeMap = false;

              if(!$scope.$$phase) {
                //$digest or $apply
                $scope.$apply(function(){
                  $scope.myStyle = {"height":"400px"}
                });
              }
          }, 5000);

          var centerMap = $interval( function(){
            $scope.map.center = {latitude: $scope.map.markers[0].latitude, longitude: $scope.map.markers[0].longitude};
          }, 5000);

          $scope.toggleCenter = function() {
            if (angular.isDefined(centerMap)) {
              $interval.cancel(centerMap);
              centerMap = undefined;
            } else {
               centerMap = $interval( function(){
                $scope.map.center = {latitude: $scope.map.markers[0].latitude, longitude: $scope.map.markers[0].longitude};
              }, 5000);
            }
          };

          $scope.toggle = {
            cb1: true
          };
          $scope.message = 'false';
          $scope.onChange = function(cbState) {
            $scope.message = cbState;
          };

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

   $scope.options = {
       chart: {
           type: 'lineWithFocusChart',
           height: 450,
           margin : {
               top: 20,
               right: 20,
               bottom: 60,
               left: 40
           },
           duration: 500,
           useInteractiveGuideline: true,
           xAxis: {
               axisLabel: 'Time',
               tickFormat: function(d){return d3.time.format('%H:%M:%S')(new Date(d * 1000));}
           },
           x2Axis: {
               tickFormat: function(d){return d3.time.format('%H:%M:%S')(new Date(d * 1000));}
           },
           yAxis: {
               axisLabel: '',
               tickFormat: function(d){
                   return d3.format(',.2f')(d);
               },
               rotateYLabel: false
           },
           y2Axis: {
               tickFormat: function(d){
                   return d3.format(',.1f')(d);
               }
           }

       }
   };

   /* Random Data Generator (took from nvd3.org) */
   function generateData() {
       return stream_layers(3,10+Math.random()*200,.1).map(function(data, i) {
           return {
               key: 'Stream' + i,
               values: data
           };
       });
   }

   /* Inspired by Lee Byron's test data generator. */
   function stream_layers(n, m, o) {
       if (arguments.length < 3) o = 0;
       function bump(a) {
           var x = 1 / (.1 + Math.random()),
               y = 2 * Math.random() - .5,
               z = 10 / (.1 + Math.random());
           for (var i = 0; i < m; i++) {
               var w = (i / m - y) * z;
               a[i] += x * Math.exp(-w * w);
           }
       }
       return d3.range(n).map(function() {
           var a = [], i;
           for (i = 0; i < m; i++) a[i] = o + o * Math.random();
           for (i = 0; i < 5; i++) bump(a);
           return a.map(stream_index);
       });
   }

   /* Another layer generator using gamma distributions. */
   function stream_waves(n, m) {
       return d3.range(n).map(function(i) {
           return d3.range(m).map(function(j) {
               var x = 20 * j / m - i / 3;
               return 2 * x * Math.exp(-.5 * x);
           }).map(stream_index);
       });
   }

   function stream_index(d, i) {
       return {x: i, y: Math.max(0, d)};
   }
});
