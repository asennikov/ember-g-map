import Ember from 'ember';
import layout from '../templates/components/g-map';

const { isEmpty, isPresent, computed, observer, run } = Ember;

export default Ember.Component.extend({
  layout: layout,
  classNames: ['g-map'],
  bannedOptions: Ember.A(['center', 'zoom']),

  init() {
    this._super();
    this.markers = Ember.A();
    if (isEmpty(this.get('options'))) {
      this.set('options', {});
    }
  },

  permittedOptions: computed('options', function() {
    let { options, bannedOptions } = this.getProperties(['options', 'bannedOptions']);
    let permittedOptions = {};
    for (let option in options) {
      if (options.hasOwnProperty(option) && !bannedOptions.contains(option)) {
        permittedOptions[option] = options[option];
      }
    }
    return permittedOptions;
  }),

  didInsertElement() {
    this._super();
    if (isEmpty(this.get('map'))) {
      let canvas = this.$().find('.g-map-canvas').get(0);
      let options = this.get('permittedOptions');
      this.set('map', new google.maps.Map(canvas, options));
    }
    this.setZoom();
    this.setCenter();
    if (this.get('shouldFit')) {
      this.fitToMarkers();
    }
  },

  permittedOptionsChanged: observer('permittedOptions', function() {
    run.once(this, 'setOptions');
  }),

  setOptions() {
    let map = this.get('map');
    let options = this.get('permittedOptions');
    if (isPresent(map)) {
      map.setOptions(options);
    }
  },

  zoomChanged: observer('zoom', function() {
    run.once(this, 'setZoom');
  }),

  setZoom() {
    let map = this.get('map');
    let zoom = this.get('zoom');
    if (isPresent(map)) {
      map.setZoom(zoom);
    }
  },

  coordsChanged: observer('lat', 'lng', function() {
    run.once(this, 'setCenter');
  }),

  setCenter() {
    let map = this.get('map');
    let lat = this.get('lat');
    let lng = this.get('lng');

    if (isPresent(map) && isPresent(lat) && isPresent(lng)) {
      let center = new google.maps.LatLng(lat, lng);
      map.setCenter(center);
    }
  },

  registerMarker(marker) {
    this.get('markers').addObject(marker);
  },

  unregisterMarker(marker) {
    this.get('markers').removeObject(marker);
  },

  fitToMarkers() {
    let markers = this.get('markers').filter((marker) => {
      return isPresent(marker.get('lat')) && isPresent(marker.get('lng'));
    });

    if (markers.length > 0) {
      let map = this.get('map');
      let bounds = new google.maps.LatLngBounds();
      let points = markers.map((marker) => {
        return new google.maps.LatLng(marker.get('lat'), marker.get('lng'));
      });

      points.forEach((point) => bounds.extend(point));
      map.fitBounds(bounds);
    }
  }
});
