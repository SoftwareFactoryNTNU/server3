angular.module('MyApp')
  .controller('AdministrativeCtrl', function($scope, $alert, $auth, $rootScope, $mdDialog, Account) {
    $rootScope.title = "My Requests"
    $rootScope.subtitle = "Dashboard / My Requests"
    $scope.data = {
      my_requests: [],
      senders: [],
      projects: []
    }

    function loadRequests() {
      Account.getMyRequests().success(function(response) {
        $scope.data.my_requests = response.data.requests;
        $scope.data.senders = response.data.senders;
        $scope.data.projects = response.data.projects;
      }).catch(function(err) {
        showPopup('Could not load requests.', err.data.message, function() {

        });
      })
    }
    loadRequests();

    $scope.getProjectName = function(project_id) {
      console.log('getting');
      for (i = 0; i < $scope.data.projects.length; i ++) {
        if ($scope.data.projects[i]._id == project_id) {
          return $scope.data.projects[i].name;
        }
      }
    }

    $scope.getSenderName = function(sender_id) {
      for (i = 0; i < $scope.data.senders.length; i ++) {
        if ($scope.data.senders[i]._id == sender_id) {
          return $scope.data.senders[i].first_name + ' ' + $scope.data.senders[i].last_name;
        }
      }
    }

    $scope.approveRequest = function(request_id) {
      Account.approveRequest({
        request_id: request_id
      }).success(function(response) {
        loadRequests();
      }).catch(function(err) {
        showPopup('Could not approve request.', err.data.message, function() {

        });
      })
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
  });
