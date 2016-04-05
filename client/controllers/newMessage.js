angular.module('MyApp')
  .controller('NewMessageCtrl', function($scope, $alert, $auth, $state, Account, $mdDialog) {

    if ($state.get('admin.newmessage').data != undefined) {
      $scope.data = $state.get('admin.newmessage').data;
      Account.getSingleCrash({
        crash_id: $state.get('admin.newmessage').data
      }).success(function(response) {
        console.log(response);
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

  });
