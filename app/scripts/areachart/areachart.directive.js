(function() {
  'use strict';

  function areachartDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/areachart/areachart.directive.html',
      controller: 'AreachartController',
      controllerAs: 'acCtrl'
    };
  }

  angular.module('uncertApp.areachart').directive('areachartDirective', areachartDirective);
})();
