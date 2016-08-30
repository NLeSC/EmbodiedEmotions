/**
 * Constants of core module
 *
 * @namespace core
 */
(function() {
  'use strict';

  angular.module('uncertApp.core')
    /**
     * @class core.pattyConf
     * @memberOf core
     */
    .constant('uncertConf', {
      // to work without server uncomment below
      // SITES_JSON_URL: 'data/sites.json',
      /**
       * Url for json file with data url
       *
       * @type {String}
       * @memberof core.uncertConf
       */
      // DATA_JSON_URL: 'file:data/contextual.timeline04-02.json'
      // DATA_JSON_URL: 'https://raw.githubusercontent.com/NLeSC/UncertaintyVisualization/gh-pages/data/contextual.timeline04-02.json',
      // DATA_JSON_URL: 'https://raw.githubusercontent.com/NLeSC/UncertaintyVisualization/narratives/app/data/embodied_0202.json',
      DATA_JSON_URL: 'file:data/predicted/love.json',
      BODY_PARTS: ["bile", "blood", "breast", "eyes", "hair", "hands", "heart", "mind", "soul", "sweat", "tears", "tongue", "veins", "cheeks", "head", "body", "breath", "face", "mouth", "senses", "womb", "arms", "jaws", "lips", "spirit", "tooth", "varia", "wound", "knees", "voice", "conscience", "limbs", "neck", "ears", "throat", "legs", "intestines", "bones", "wrists", "none", "stomach", "shoulder", "feet"]
    });
})();
