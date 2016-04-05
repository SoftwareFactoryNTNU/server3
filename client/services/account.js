angular.module('MyApp')
  .factory('Account', function($http) {
    return {
      getProfile: function() {
        return $http.get('/api/me');
      },
      updateProfile: function(profileData) {
        return $http.put('/api/me', profileData);
      },
      updatePassword: function(profileData) {
        return $http.post('/api/me', profileData);
      },
      getMyUnits: function() {
        return $http.get('/api/get_all_crashes');
      },
      getMyCrashes: function() {
        return $http.get('/api/get_all_crashes');
      },
      getSingleCrash: function(data) {
        return $http.post('/api/get_single_crash', data);
      },
      addPiUnit: function(data) {
        return $http.post('/api/connect_user_to_pi', data);
      },
      getSingleUnitCrashes: function(data) {
        return $http.post('/api/single_unit_crashes', data);
      }
    };
  });
