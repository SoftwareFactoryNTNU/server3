angular.module('MyApp')
  .controller('ArchiveCtrl', function($scope, $auth, $rootScope, $state) {
    console.log('ArchiveCtrl');
    $rootScope.subtitle = "Dashboard / Patient archive";
    console.log($state.get('admin.archive'));
    if ($state.get('admin.archive').data != undefined && $state.get('admin.archive').data.selected_patient != undefined) {
      $scope.patient = $state.get('admin.archive').data.selected_patient;
      $scope.$root.title = $scope.patient.first_name + ' ' + $scope.patient.last_name;
    } else {
      $state.go('admin.patients');
    }

    $scope.family = [
      {
        first_name: "Steinar",
        last_name: "Klaussen",
        phone_number: 48280027,
        email: "Steinar@email.com",
        _id: "123123123"
      }
    ];

    $scope.messages = [
      {
        sender_name: "Steinar Klaussen",
        patient_name: "Walborg Klaussen",
        title: "Dårlig ditt",
        date_received: "04.03.2016",
        urgency_level: "Important",
        opened: false
      },
      {
        sender_name: "Steinar Klaussen",
        title: "Dårlig datt",
        patient_name: "Walborg Klaussen",
        date_received: "04.03.2016",
        urgency_level: "Important",
        opened: true
      }
    ];

    $scope.send_message = function(member_id) {
      console.log(member_id);
      for (i = 0; i < $scope.family.length; i++) {
        if ($scope.family[i]._id == member_id) {
          $state.get('admin.newmessage').data = {
            message_receiver: $scope.family[i]
          }
          $state.go('admin.newmessage')
        }
      }
    }

    $scope.open_message = function() {
      console.log('opened');
    }

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

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
       axisFormat: 'HH:mm',
       timeFormat: 'HH:mm',
       height: 450,
       editable: false,
       header:{
         left: 'month basicWeek agendaWeek agendaDay',
         center: 'title',
         right: 'today prev,next'
       },
       eventClick: function(eventt){
         console.log(eventt);
        },
       dayClick: $scope.alertEventOnClick,
       eventDrop: $scope.alertOnDrop,
       eventResize: $scope.alertOnResize
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
  });
