angular.module('MyApp')
  .controller('CalendarCtrl', function($scope, $alert, $auth, $rootScope, $state, $timeout) {
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    $scope.minDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    $scope.sending_message = false;

    if ($state.current.name == 'admin.calendar') {
      $rootScope.title = "Calendar";
      $rootScope.subtitle = "Dashboard / Calendar";
    } else if ($state.current.name == 'admin.addevent') {
      $rootScope.title = "Add event";
      $rootScope.subtitle = "Dashboard / Add event";
    }

    $scope.eventSources = [
    [
        {
            "title": 'All Day Event',
            "start": new Date(y, m, d)
         },
         {
            "title": 'Long Event',
            "start": new Date(y, m, d - 5),
            "end": new Date(y, m, d - 2)
        },
        {
           "title": 'Long Event',
           "start": new Date(y, m, d - 5),
           "end": new Date(y, m, d - 2)
       },
       {
          "title": 'Long Event',
          "start": new Date(y, m, d - 5),
          "end": new Date(y, m, d - 2)
      },
      {
         "title": 'Long Event',
         "start": new Date(y, m, d - 5),
         "end": new Date(y, m, d - 2)
     }
    ]
];
    $scope.uiConfig = {
     calendar:{
       timeFormat: 'HH:mm',
       axisFormat: 'HH:mm',
       height: 450,
       editable: true,
       header:{
         left: 'month basicWeek agendaWeek agendaDay',
         center: 'title',
         right: 'today prev,next'
       },
       views: {
        agendaDay: { // name of view
            timeFormat: 'HH:mm',
            // other view-specific options here
        },
        agendaWeek: { // name of view
            timeFormat: 'HH:mm',
            // other view-specific options here
        }
      },
       eventClick: function(eventt){
         console.log(eventt);
        },
       dayClick: $scope.alertEventOnClick,
       eventDrop: $scope.alertOnDrop,
       eventResize: $scope.alertOnResize
     }
   };

   $scope.add_event = function() {
     $scope.sending_message = true;
   };

   $scope.showAlert = function(message, duration) {
     $alert({
       content: message,
       animation: 'fadeZoomFadeDown',
       type: 'material',
       duration: duration
     });
   };
  });
