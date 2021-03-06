(function() {
  'use strict';

  function PerspectiveLaneChartOptionSelectorController(Messagebus) {
    this.options = [
      'belief',
      'certainty',
      'possibility',
      'sentiment',
      'when'
    ];
    this.selectedOption = 'sentiment';

    this.changeOption = function(value) {
      this.selectedOption = value;
      Messagebus.publish('newPerspectiveOption', value);
    };
  }

  angular.module('uncertApp.perspectivelanechart').controller('PerspectiveLaneChartOptionSelectorController', PerspectiveLaneChartOptionSelectorController);
})();
