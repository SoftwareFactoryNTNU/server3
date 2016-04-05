angular.module('MyApp', ['ngResource', 'ngMessages', 'ui.router', 'mgcrea.ngStrap', 'satellizer', 'ui.bootstrap', 'ngCookies', 'ngMaterial', 'angular-spinkit', 'uiGmapgoogle-maps'])
  .config(function($stateProvider, $urlRouterProvider, $authProvider, $mdThemingProvider, uiGmapGoogleMapApiProvider) {

    $mdThemingProvider.theme('docs-dark', 'default').primaryPalette('yellow').dark();

    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyCwtgP3ap8vcxFVkkHwh5bhlM85Ot2YYYQ',
        v: '3.25', //defaults to latest 3.X anyhow
        libraries: 'geometry,visualization'
    });

    $stateProvider
      .state('/', {
        url: '/',
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl',
        resolve: {
          alreadyAuthenticated: alreadyAuthenticated
        }
      })
      .state('/forgotten_password', {
        url: '/forgotten',
        templateUrl: 'partials/forgotten_password.html',
        controller: 'LoginCtrl'
      })
      .state('admin', {
        url: '/admin',
        templateUrl: 'partials/admin.html',
        controller: 'MasterCtrl',
        abstract: true,
        resolve: {
          authenticated: authenticated
        }
      })
      .state('admin.calendar', {
        url: '/calendar',
        templateUrl: 'partials/calendar.html',
        controller: 'CalendarCtrl'
      })
      .state('admin.addevent', {
        url: '/addevent',
        templateUrl: 'partials/add-event.html',
        controller: 'CalendarCtrl'
      })
      .state('admin.patients', {
        url: '/patients',
        templateUrl: 'partials/patients.html',
        controller: 'PatientsCtrl'
      })
      .state('admin.addpatient', {
        url: '/addpatient',
        templateUrl: 'partials/add-patient.html',
        controller: 'PatientsCtrl'
      })
      .state('admin.archive', {
        params: { 'patient': null },
        url: '/archive',
        templateUrl: 'partials/archive.html',
        controller: 'ArchiveCtrl'
      })
      .state('admin.messages', {
        url: '/messages',
        templateUrl: 'partials/messages.html',
        controller: 'MessagesCtrl'
      })
      .state('admin.newmessage', {
        url: '/newmessage',
        templateUrl: 'partials/new-message.html',
        controller: 'NewMessageCtrl'
      })
      .state('admin.newglobalmessage', {
        url: '/newglobalmessage',
        templateUrl: 'partials/new-global-message.html',
        controller: 'MessagesCtrl'
      })
      .state('admin.openmessage', {
        url: '/openmessage',
        templateUrl: 'partials/open-message.html',
        controller: 'MessagesCtrl'
      })
      .state('admin.administrative', {
        url: '/administrative',
        templateUrl: 'partials/administrative.html',
        controller: 'AdministrativeCtrl'
      })
      .state('login', {
        url: '/login',
        templateUrl: 'partials/login.html',
        controller: 'LoginCtrl',
        resolve: {
          alreadyAuthenticated: alreadyAuthenticated
        }
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'partials/signup.html',
        controller: 'SignupCtrl'
      })
      .state('logout', {
        url: '/logout',
        template: null,
        controller: 'LogoutCtrl',
        resolve: {
          authenticated: authenticated
        }
      })
      .state('profile', {
        url: '/profile',
        templateUrl: 'partials/profile.html',
        controller: 'ProfileCtrl',
        resolve: {
          authenticated: authenticated
        }
      });

      function authenticated($q, $location, $auth) {
        var deferred = $q.defer();

        if (!$auth.isAuthenticated()) {
          $location.path('/login');
        } else {
          deferred.resolve();
        }

        return deferred.promise;
      }

      function alreadyAuthenticated($q, $location, $auth) {
        var deferred = $q.defer();

        if ($auth.isAuthenticated()) {
          $location.path('/admin/users');
        } else {
          deferred.resolve();
        }

        return deferred.promise;
      }

    $urlRouterProvider.otherwise('/admin/patients');

    $authProvider.facebook({
      clientId: '846493822102669'
    });

    $authProvider.google({
      clientId: ''
    });

    $authProvider.github({
      clientId: ''
    });

    $authProvider.linkedin({
      clientId: ''
    });

    $authProvider.yahoo({
      clientId: ''
    });

    $authProvider.twitter({
      url: '/auth/twitter'
    });

    $authProvider.live({
      clientId: ''
    });

    $authProvider.oauth2({
      name: 'foursquare',
      url: '/auth/foursquare',
      clientId: '',
      redirectUri: window.location.origin || window.location.protocol + '//' + window.location.host,
      authorizationEndpoint: 'https://foursquare.com/oauth2/authenticate'
    });
  });
