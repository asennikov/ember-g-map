/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-g-map',

  included: function(app, parentAddon) {
    var target = (parentAddon || app);
    target.import('vendor/addons.css');

    var gMapOptions = target.options.gMap || {};
    var extensions = gMapOptions.extensions || [];
    for (let i = 0; i < extensions.length; i++) {
      let extension = extensions[i];
      if (extension === 'clustering') {
        app.import(app.bowerDirectory + '/markerclustererplus/src/markerclusterer.js');
      }
    }
  },

  contentFor: function(type, config) {
    var content = '';

    if (type === 'head') {
      var src = "//maps.googleapis.com/maps/api/js";
      var gMapConfig = config['g-map'] || {};
      var params = [];

      var key = gMapConfig.key;
      if (key) {
        params.push('key=' + encodeURIComponent(key));
      }

      var libraries = gMapConfig.libraries;
      if (libraries && libraries.length) {
        params.push('libraries=' + encodeURIComponent(libraries.join(',')));
      }

      var protocol = gMapConfig.protocol;
      if (protocol) {
        src = protocol + ":" + src;
      }

      src += '?' + params.join('&');
      content = '<script type="text/javascript" src="' + src + '"></script>';
    }

    return content;
  }
};
