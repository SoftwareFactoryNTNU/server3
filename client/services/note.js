angular.module('MyApp')
  .factory('Note', function($http) {
    return {
      getNote: function() {
        return $http.get('/api/note');
      },
      updateNote: function(noteData) {
        return $http.post('/api/update_note', noteData)
      },
      deleteNote: function(noteData) {
        return $http.post('/api/delete_note', noteData)
      },
      editNote: function(noteData) {
        return $http.post('/api/edit_note', noteData)
      }
    };
  });
