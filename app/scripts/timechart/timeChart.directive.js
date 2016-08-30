(function() {
  'use strict';

  function timeChartDirective() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/timechart/timeChart.directive.html',
      controller: 'TimeChartController',
      controllerAs: 'tcCtrl'
    };
  }

  angular.module('uncertApp.charts').directive('timeChartDirective', timeChartDirective);
})();
