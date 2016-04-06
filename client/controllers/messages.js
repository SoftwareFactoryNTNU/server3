angular.module('MyApp')
  .controller('MessagesCtrl', function($scope, $alert, $auth, $rootScope, $state, Account, $mdDialog, $timeout, uiGmapGoogleMapApi) {
    if ($state.get('admin.newmessage').data != undefined) {
      if ($state.get('admin.newmessage').data.message_receiver != undefined) {
        $scope.message_receiver = $state.get('admin.newmessage').data.message_receiver;
        $scope.message_receiver_title = $scope.message_receiver.first_name + ' ' + $scope.message_receiver.last_name;
      }
    }
    if ($state.get('admin.openmessage').data != undefined) {
      if ($state.get('admin.openmessage').data.new_message_sender != undefined) {
        $scope.new_message_sender = $state.get('admin.openmessage').data.new_message_sender;
        $scope.new_message_sender_sender = $scope.new_message_sender.first_name + ' ' + $scope.new_message_sender.last_name;
      }
    }
    if ($state.current.name == 'admin.messages') {
      $rootScope.title = "My Crashes"
      $rootScope.subtitle = "Dashboard / My Crashes"
    } else if ($state.current.name == 'admin.newglobalmessage') {
      $rootScope.title = 'Show Crash'
      $rootScope.subtitle = "Dashboard / Show Crash"
    }
    $scope.show_global_message = false;
    $scope.reply = false;
    $scope.data = {
      my_crashes: []
    };

    $scope.number_tabs = [{
      number: 1
    }];

    Account.getMyCrashes().success(function(response) {
      console.log(response);
      $scope.data.my_crashes = response.data.crashes;
      $scope.data.my_units = response.data.pis;
    }).catch(function(err) {
      showPopup('Error!', 'Could not load Crashes, make sure you are connected to the internet. Try logging in again.', function() {
      });
    });

    $scope.getUnitName = function(pi_id) {
      for (i = 0; i < $scope.data.my_units.length; i++) {
        if ($scope.data.my_units[i].pi_id == pi_id) {
          return $scope.data.my_units[i].name;
        }
      }
    }

    $scope.unixToString = function(unixNumber) {
      var date = new Date(unixNumber * 1000);
      var minutes = date.getMinutes();if (minutes < 10) {minutes = '0' + minutes;}
      var hours = date.getHours();if (hours < 10) {hours = '0' + hours;}
      var days = date.getDate();if (days < 10) {days = '0' + days;}
      var month = date.getMonth() + 1;if (month < 10) {month = '0' + month;}
      var year = date.getFullYear();if (year < 10) {year = '0' + year;}

      return [days + '-' + month + '-' + year,hours + ':' + minutes];
    };

    $scope.show_crash = function(id) {
      $state.get('admin.newmessage').data = id;
      $state.go('admin.newmessage');
    }

    $scope.show_and_respond = function(id) {
      Account.openRuh({
        ruh_id: id
      }).success(function(response) {
        $state.get('admin.newmessage').data = response.data;
        $state.go('admin.newmessage');
      }).catch(function(err) {
        showPopup('Could not open reponse!', err.data.message, function() {

        });
      })
    }

    $scope.reply_to_message = function() {
      $scope.reply = true;
    }

    $scope.send_global_message = function() {

    }

    $scope.send_personal_message = function() {
      $scope.processingData = true;
      var data = {

      };
      Account.sendPersonalMessage().success(function(response) {
        if (response.status != 200) {
          $scope.showAlert(response.data.message, 7);
          $scope.processingData = false;
        } else {
          $scope.showAlert(response.data.message, 7);
          $scope.processingData = false;
        }
      })
    }

    $scope.reply_personal_message = function() {
      console.log('reply_personal_message');
    }
    $scope.show_filtering = function() {
      $scope.show_filter = !$scope.show_filter;
    }

    $scope.showAlert = function(message, duration) {
      $alert({
        content: message,
        animation: 'fadeZoomFadeDown',
        type: 'material',
        duration: duration
      });
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
    console.log('INIT');
    $scope.getCreatorName = function(creator_id) {
      console.log('getting creator name');
      for (i = 0; i < $scope.data.users.length; i++) {
        if (creator_id == $scope.data.users[i]._id) {
          return $scope.data.users[i].first_name + ' ' + $scope.data.users[i].last_name;
        }
      }
    };

    $scope.getProjectName = function(project_id) {
      console.log('getting project name');
      for (i = 0; i < $scope.data.projects.length; i++) {
        if (project_id == $scope.data.projects[i]._id) {
          return $scope.data.projects[i].name;
        }
      }
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

    console.log("this is from messages controller");
    var cords = [[63.568138,10.295417],[63.314919,10.752056],[63.108749,11.5345],[63.086418,11.648694],[63.827442,10.371333],[62.961193,10.090278],[62.743168,9.291194],[63.122833,10.591667],[63.123749,9.443389],[63.210278,10.70875],[63.016499,10.958944],[63.163502,10.526361],[62.112194,11.48656],[63.019974,9.197861],[63.328529,11.027583],[63.390305,11.418528],[63.141998,11.722361],[63.147141,9.11575],[62.876141,9.661972],[62.821918,10.608694],[62.7085,9.800861],[62.412193,11.18656],[62.550045646,12.050345356]];
    $scope.map_coordinates = cords;
    var speedArray = [55, 48, 49, 50, 50, 51, 48, 50, 50, 48, 51, 52, 54, 55, 55, 55, 56, 56, 55, 54, 57, 55, 54, 55, 54, 56, 56, 56, 56, 54, 56, 56, 54, 56, 55, 54, 56, 56, 54];

    /**
     * Depricated
     */
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

      /**
       * Depricated
       */
        uiGmapGoogleMapApi.then(function(maps) {
          $timeout(function() {
            $scope.$apply();
          });
        });



  });
