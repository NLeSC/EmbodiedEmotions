/**
 * @namespace core
 */
(function() {
  'use strict';

  /**
   * @class
   * @memberOf core
   */
  function DataService($http, $q, $log, $timeout, d3, uncertConf, Messagebus, toastr, NdxService) {
    var me = this;
    this.data = {};
    var deferred = $q.defer();

    /**
     * Promise for loading the sites remotely.
     * Can be used to perform action when loading sites has been completed.
     *
     * @type {Promise}
     */
    this.ready = deferred.promise;

    this.doLoad = function(fileName) {
      NdxService.resetData();

      d3.json(fileName, function(error, json) {
        if (error) {
          return console.warn(error);
        }
        me.data = json;
        deferred.resolve(me.data);

        //Evil hacky timeout function to resolve a race condition.
        $timeout(function() {
          Messagebus.publish('data loaded', this.getData);
        }.bind(this), 100);
      }.bind(this));
    };

    /**
     * Load data from server
     *
     * @returns {Promise}
     */
    this.load = function() {
      var dataType = uncertConf.DATA_JSON_URL.split(':')[0];

      if (dataType === 'file') {
        var fileName = uncertConf.DATA_JSON_URL.split(':')[1];
        this.doLoad(fileName);
      } else if (dataType === 'http' || dataType === 'https') {
        me.data = $http.get(uncertConf.DATA_JSON_URL).success(this.onLoad).error(this.onLoadFailure);
      } else {
        console.log('Unknown data type.');
      }
      // return me.data;
    }.bind(this);

        /**
     * Load data from server
     *
     * @returns {Promise}
     */
    this.urlload = function(request) {
      $http.get(request.targetScope.fc.fileName).success(this.onUrlLoad).error(this.onLoadFailure);
    }.bind(this);

    this.onUrlLoad = function(response) {
      me.data = response;
      toastr.success('New data loaded!');
      Messagebus.publish('data loaded', this.getData);
      // Messagebus.publish('new data loaded', this.getData);
    }.bind(this);

    this.onLoad = function(response) {
      me.data = response;
      deferred.resolve(response);
      Messagebus.publish('data loaded', this.getData);
      // Messagebus.publish('new data loaded', this.getData);
    }.bind(this);

    this.onLoadFailure = function() {
      $log.log('Failed to load data!!');
      toastr.error('Failed to load data!!');
      deferred.reject.apply(this, arguments);
    };

    this.getData = function () {
      return this.data;
    }.bind(this);

    this.getFileList = function() {
      return uncertConf.EMOTIONS;
    };

    Messagebus.subscribe('data request', this.urlload);
  }

  angular.module('uncertApp.core')
    .service('DataService', DataService);
})();
