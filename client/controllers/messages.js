angular.module('MyApp')
  .controller('MessagesCtrl', function($scope, $alert, $auth, $rootScope, $state, Account, $mdDialog) {
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
  });
