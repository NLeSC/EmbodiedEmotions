(function() {
  'use strict';

  function logoonlyDirective() {
    return {
      restrict: 'EA',
      templateUrl: 'scripts/logoonly/logoonly.directive.html',
      controller: 'LogoonlyController',
      controllerAs: 'logoooos'
    };
  }

  angular.module('uncertApp.logoonly').directive('logoonlyDirective', logoonlyDirective);
})();
