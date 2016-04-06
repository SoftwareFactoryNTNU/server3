angular.module('MyApp')
.controller('MasterCtrl', function($scope, $alert, $auth, $cookieStore, $timeout, $rootScope, Account) {
  console.log('MasterCtrl');

  $rootScope.$on('$stateChangeStart',
function(event, toState, toParams, fromState, fromParams){
  if (toState.name == 'admin.calendar') {
    $rootScope.title = "Calendar"
    $rootScope.subtitle = "Dashboard / Calendar"
  } else if (toState.name == 'admin.patients') {
    $rootScope.title = "Patients"
    $rootScope.subtitle = "Dashboard / Patients"
  } else if (toState.name == 'admin.messages') {
    $rootScope.title = "Messages"
    $rootScope.subtitle = "Dashboard / Messages"
  } else if (toState.name == 'admin.administrative') {
    $rootScope.title = "Administrative"
    $rootScope.subtitle = "Dashboard / Administrative"
  } else if (toState.name == 'admin.addpatient') {
    $rootScope.title = "Add patient"
    $rootScope.subtitle = "Dashboard / Add patient"
  } else if (toState.name == 'admin.newglobalmessage') {
    $rootScope.title = "New global message"
    $rootScope.subtitle = "Dashboard / New global message"
  }
})


    var mobileView = 992;
    $scope.toggle = false;
    $cookieStore.put('toggle', $scope.toggle);

    $scope.getWidth = function() {
        return window.innerWidth;
    };

    $scope.$watch($scope.getWidth, function(newValue, oldValue) {
        if (newValue >= mobileView) {
            if (angular.isDefined($cookieStore.get('toggle'))) {
                $scope.toggle = ! $cookieStore.get('toggle') ? false : true;
            } else {
                $scope.toggle = true;
            }
        } else {
            $scope.toggle = false;
        }

    });

    Account.getProfile().success(function(response) {
      $rootScope.profile_name = response.first_name + ' ' + response.last_name;
    }).catch(function(err) {
      console.log(err);
    })

    $scope.toggleSidebar = function() {
        $scope.toggle = !$scope.toggle;
        $cookieStore.put('toggle', $scope.toggle);
    };


    window.onresize = function() {
        $scope.$apply();
    };
    $timeout(function () {
      $scope.toggleSidebar();
    }, 100);
})
