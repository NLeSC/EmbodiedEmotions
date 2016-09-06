(function() {
  'use strict';

  function linechartDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/linechart/linechart.directive.html',
      controller: 'LinechartController',
      controllerAs: 'ctrl',
      scope: {},
      bindToController: true
    };
  }

  angular.module('uncertApp.charts').directive('linechartDirective', linechartDirective);
})();
