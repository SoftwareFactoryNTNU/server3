angular.module('MyApp')
  .controller('LoginCtrl', function($scope, $alert, $auth, $state, $mdDialog) {
    $scope.data = {};
    $scope.data.new_email = false;

    $scope.login = function() {
      console.log('login');
      console.log($scope.data);
      $auth.login({ email: $scope.data.email, password: $scope.data.password })
        .then(function(response) {
          $alert({
            content: 'You have successfully logged in',
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 3
          });
          $state.go('admin.patients');
        })
        .catch(function(response) {
          if (response.status == 402) {
            $scope.data.new_email = true;
          } else {
            showPopup('Error!', response.data.message);
          }
        });
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
