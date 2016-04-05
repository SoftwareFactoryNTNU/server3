angular.module('MyApp')
  .controller('PatientsCtrl', function($scope, $mdDialog, $state, Account, $mdMedia, $alert, $auth, $rootScope, $timeout) {

    if ($state.current.name == 'admin.patients') {
      $rootScope.title = "My EasyCrash Units"
      $rootScope.subtitle = "Dashboard / My EasyCrash Units"
    } else {
      $rootScope.title = "Add EasyCrash Unit"
      $rootScope.subtitle = "Dashboard / Add EasyCrash Unit"
    }
    $scope.data = {
      my_units: [],
      number_tabs: [{
        number: 1
      }]
    };

    $timeout(function() {
    }, 1000)

  Account.getMyCrashes().success(function(response) {
    console.log(response);
    $scope.data.my_units = response.data.pis;
  }).catch(function(err) {
    showPopup('Error!', 'Could not get my projects, try logging in again.', function() {
    });
  });

    $scope.add_unit = function() {
      console.log($scope.data);
      Account.addPiUnit({
        secret_code: $scope.data.secret_code
      }).success(function(response) {
        showPopup('Success!', 'The new unit was added!', function() {
          $state.go('admin.patients');
        });
      }).catch(function(err) {
        showPopup('EasyCrash unit not added!', err.data.message, function() {

        });
      });
    }

    $scope.show_single_unit_crashes = function(ev, unit_id) {

      $state.get('admin.patients').data = unit_id;

      var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
      $mdDialog.show({
        templateUrl: 'partials/single-unit-crashes.html',
        controller: ShowSingleUnitCrashesCtrl,
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        fullscreen: useFullScreen
      })
      .then(function(answer) {
        $scope.status = 'You said the information was "' + answer + '".';
      }, function() {
        $scope.status = 'You cancelled the dialog.';
      });
      };

      function ShowSingleUnitCrashesCtrl($scope, $mdDialog, $state, Account, $mdMedia) {
        console.log($state.get('admin.patients').data);
        $scope.data = {
          my_crashes: []
        }
        Account.getSingleUnitCrashes({pi_id: $state.get('admin.patients').data}).success(function(response) {
          $scope.data.my_crashes = response.data.crashes;
          $scope.data.unit = response.data.pi;
        }).catch(function(err) {
          showPopup('EasyCrash unit not added!', err.data.message, function() {
          });
        })

        $scope.show_crash = function(id) {
          $state.get('admin.newmessage').data = id;
          $state.go('admin.newmessage');
          $mdDialog.hide();
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
      }

    $scope.go_to_add_patients = function(patient_id) {
      $state.go('admin.addpatient');
    }


    $scope.show_code = function(patient_id) {
      for (i = 0; i < $scope.patients.length; i++) {
        if ($scope.patients[i]._id == patient_id) {
          $scope.patients[i].show_code = true;
        } else {
          $scope.patients[i].show_code = false;
        }
      }
    };

    $scope.showAlert = function(message, duration) {
      $alert({
        content: message,
        animation: 'fadeZoomFadeDown',
        type: 'material',
        duration: duration
      });
    }

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
