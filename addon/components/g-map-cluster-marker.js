import Ember from 'ember';
import GMapClusterer from './g-map-clusterer';
import GMapMarkerComponent from './g-map-marker';

const { isPresent, computed, assert } = Ember;

const GMapClusterMarkerComponent =  GMapMarkerComponent.extend({
  mapContext: computed.alias('clustererContext.mapContext'),

  init() {
    this._super(arguments);

    const clustererContext = this.get('clustererContext');
    assert('Must be inside {{#g-map-clusterer}} component with context set',
      clustererContext instanceof GMapClusterer);
  },

  unsetMarkerFromMap() {
    const marker = this.get('marker');
    const clusterer = this.get('clustererContext.clusterer');

    if (isPresent(marker) && isPresent(clusterer)) {
      clusterer.removeMarker(marker);
    }
  },

  setMap() {
    const clusterer = this.get('clustererContext.clusterer');
    const marker = this.get('marker');

    if (isPresent(marker) && isPresent(clusterer)) {
      clusterer.addMarker(marker);
    }
  }
});

GMapClusterMarkerComponent.reopenClass({
  positionalParams: ['clustererContext']
});

export default GMapClusterMarkerComponent;
