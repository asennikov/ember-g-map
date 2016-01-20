import Ember from 'ember';
import layout from '../templates/components/g-map-clusterer';
import GMapComponent from './g-map';

const { isEmpty, isPresent, computed, observer, run, assert } = Ember;

const GMapClustererComponent = Ember.Component.extend({
  layout: layout,
  classNames: ['g-map-clusterer'],

  map: computed.oneWay('mapContext.map'),
  markers: computed.oneWay('mapContext.markers'),

  init() {
    this._super(arguments);

    const mapContext = this.get('mapContext');
    assert('Must be inside {{#g-map}} component with context set', mapContext instanceof GMapComponent);

    if (isEmpty(this.get('options'))) {
      this.set('options', {});
    }
  },

  mapWasSet: observer('map', function() {
    const map = this.get('map');
    const clusterer = this.get('clusterer');

    if (isPresent(map) && isEmpty(clusterer)) {
      const options = this.get('options');
      this.set('clusterer', new MarkerClusterer(map, [], options));
    }
  }),

  willDestroyElement() {
    const clusterer = this.get('clusterer');

    if (isPresent(clusterer)) {
      clusterer.clearMarkers();
    }
  },

  markersChanged: observer('markers.@each.lat', 'markers.@each.lng', function() {
    run.once(this, 'repaintClusterer');
  }),

  repaintClusterer() {
    const clusterer = this.get('clusterer');

    if (isPresent(clusterer)) {
      clusterer.repaint();
    }
  }
});

GMapClustererComponent.reopenClass({
  positionalParams: ['mapContext']
});

export default GMapClustererComponent;
