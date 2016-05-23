(function() {
  'use strict';

  function everythingDirective() {
    return {
      restrict: 'EA',
      templateUrl: 'scripts/everything/everything.directive.html',
      controller: 'EverythingController',
      controllerAs: 'everything'
    };
  }

  angular.module('uncertApp.everything').directive('everythingDirective', everythingDirective);
})();
