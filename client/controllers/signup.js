angular.module('MyApp')
  .controller('SignupCtrl', function($scope, $alert, $auth, $http, $mdDialog) {

    $scope.data = {};
    $scope.data.user_created_successfully = false;
    $scope.data.creating_user = false;

    $scope.signup = function() {
      console.log('signup');
      $scope.data.creating_user = true;
      $http.post('/auth/signup_admin',{
        first_name: $scope.data.first_name,
        last_name: $scope.data.last_name,
        email: $scope.data.email,
        password: $scope.data.password,
        password_again: $scope.data.password_again
      }).success(function(response) {
        console.log(response);
        $scope.data.creating_user = false;
        if (response.status != 200) {
          $scope.showAlert(response.message || response.data.message, 5);
        } else {
          $scope.data.user_created_successfully = true;
        }
      }).catch(function(err) {
        $scope.data.creating_user = false;
        showPopup('Error!', err.data.message, function() {

        });
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
