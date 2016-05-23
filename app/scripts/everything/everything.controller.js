(function() {
  'use strict';

  function EverythingController($location) {
    this.changeView = function(value) {
      $location.path('/view/'+value);
    };
  }

  angular.module('uncertApp.everything')
    .controller('EverythingController', EverythingController);
})();
