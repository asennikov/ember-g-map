/* eslint-env node */
'use strict';

module.exports = {
  name: 'ember-g-map',

  included: function(app, parentAddon) {
    var target = (parentAddon || app);
    target.import('vendor/addons.css');
  },

  contentFor: function(type, config) {
    var content = '';

    if (type === 'head') {
      var src = '//maps.googleapis.com/maps/api/js';
      var gMapConfig = config['g-map'] || {};
      var params = [];

      var key = gMapConfig.key;
      if (key) {
        params.push('key=' + encodeURIComponent(key));
      }

      var version = gMapConfig.version;
      if (version) {
        params.push('v=' + encodeURIComponent(version));
      }

      var client = gMapConfig.client;
      if (client) {
        params.push('client=' + encodeURIComponent(client));
      }

      var channel = gMapConfig.channel;
      if (channel) {
        params.push('channel=' + encodeURIComponent(channel));
      }

      var libraries = gMapConfig.libraries;
      if (libraries && libraries.length) {
        params.push('libraries=' + encodeURIComponent(libraries.join(',')));
      }

      var language = gMapConfig.language;
      if (language) {
        params.push('language=' + encodeURIComponent(language));
      }

      var protocol = gMapConfig.protocol;
      if (protocol) {
        src = protocol + ':' + src;
      }

      src += '?' + params.join('&');
      content = '<script type="text/javascript" src="' + src + '"></script>';

      var exclude = gMapConfig.exclude;
      if (exclude) {
        content = ''
      }
    }

    return content;
  }
};
