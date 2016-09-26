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
      // DATA_JSON_URL: 'file:data/26-09-2016.json',
      DATA_JSON_URL: 'https://raw.githubusercontent.com/NLeSC/EmbodiedEmotions/master/app/data/predicted/anger.json',
      SERVER_JSON_PREFIX: 'https://raw.githubusercontent.com/NLeSC/EmbodiedEmotions/master/app/data/predicted/',
      BODY_PARTS: ['bile', 'blood', 'breast', 'eyes', 'hair', 'hands', 'heart', 'mind', 'soul', 'sweat', 'tears', 'tongue', 'veins', 'cheeks', 'head', 'body', 'breath', 'face', 'mouth', 'senses', 'womb', 'arms', 'jaws', 'lips', 'spirit', 'tooth', 'varia', 'wound', 'knees', 'voice', 'conscience', 'limbs', 'neck', 'ears', 'throat', 'legs', 'intestines', 'bones', 'wrists', 'none', 'stomach', 'shoulder', 'feet'],
      EMOTIONS: ['anger', 'annoyance', 'acquiescence', 'awe', 'benevolence', 'compassion', 'dedication', 'desire', 'despair', 'disgust', 'dissapointment', 'envy', 'fear', 'greed', 'happiness', 'hatred', 'honor', 'hope', 'joy', 'loss', 'love', 'loyalty', 'moved', 'offended', 'other', 'pride', 'relief', 'remorse', 'sadness', 'shame', 'spitefulness', 'suspicion', 'trust', 'unhappiness', 'vindictiveness', 'wonder', 'worry']
    });
})();
