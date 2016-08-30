(function() {
  'use strict';

  function FileController(DataService, uncertConf, Messagebus) {
    var me = this;
    this.fileName = uncertConf.DATA_JSON_URL;
    this.query = uncertConf.DATA_JSON_URL;
    this.list = DataService.getFileList();

    this.clear = function() {
      me.query = uncertConf.DATA_JSON_URL;
      me.open();
    };

    this.open = function() {
      DataService.ready.then(function() {
        Messagebus.publish('data request', me.query);
        // toastr.error('Search' + me.query);
      });
    };

    this.search = function() {
      me.open();
    };

    /**
     * When enter is pressed inside input field perform a search
     */
    this.onQueryKeyPress = function($event) {
      var enterCode = 13;
      if ($event.keyCode === enterCode) {
        me.open();
      }
    };

    this.selectData = function(fileName) {
      this.fileName = fileName;
    }

    this.openServerFile = function(fileName) {
      DataService.ready.then(function() {
        Messagebus.publish('data request', this.fileName);
        // toastr.error('Search' + me.query);
      }.bind(this));
      // DataService.load(fileName);
    };

    this.readFile = function(file) {
      DataService.doLoad(file);
    };
  }

  angular.module('uncertApp.fileLoading')
    .controller('FileController', FileController);
})();
