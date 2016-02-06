import Ember from 'ember';
import layout from '../templates/components/g-map';

const { isEmpty, isPresent, computed, observer, run, typeOf } = Ember;

export default Ember.Component.extend({
  layout: layout,
  classNames: ['g-map'],
  bannedOptions: Ember.A(['center', 'zoom']),
  events: Ember.A([
    'bounds_changed',
    'center_changed',
    'click',
    'dblclick',
    'drag',
    'dragend',
    'dragstart',
    'heading_changed',
    'idle',
    'maptypeid_changed',
    'mousemove',
    'mouseout',
    'mouseover',
    'projection_changed',
    'resize',
    'rightclick',
    'tilesloaded',
    'tilt_changed',
    'zoom_changed'
  ]),

  init() {
    this._super();
    this.set('markers', Ember.A());
    if (isEmpty(this.get('options'))) {
      this.set('options', {});
    }
  },

  permittedOptions: computed('options', function() {
    const { options, bannedOptions } = this.getProperties(['options', 'bannedOptions']);
    const permittedOptions = {};
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
      const canvas = this.$().find('.g-map-canvas').get(0);
      const options = this.get('permittedOptions');
      this.set('map', new google.maps.Map(canvas, options));
    }
    this.setZoom();
    this.setCenter();
    if (this.get('shouldFit')) {
      this.fitToMarkers();
    }
    this.attachEvents();
  },

  willDestroyElement() {
    this.detachEvents();
  },

  permittedOptionsChanged: observer('permittedOptions', function() {
    run.once(this, 'setOptions');
  }),

  setOptions() {
    const map = this.get('map');
    const options = this.get('permittedOptions');
    if (isPresent(map)) {
      map.setOptions(options);
    }
  },

  zoomChanged: observer('zoom', function() {
    run.once(this, 'setZoom');
  }),

  setZoom() {
    const map = this.get('map');
    const zoom = this.get('zoom');
    if (isPresent(map)) {
      map.setZoom(zoom);
    }
  },

  coordsChanged: observer('lat', 'lng', function() {
    run.once(this, 'setCenter');
  }),

  setCenter() {
    const map = this.get('map');
    const lat = this.get('lat');
    const lng = this.get('lng');

    if (isPresent(map) && isPresent(lat) && isPresent(lng)) {
      const center = new google.maps.LatLng(lat, lng);
      map.setCenter(center);
    }
  },

  registerMarker(marker) {
    this.get('markers').addObject(marker);
  },

  unregisterMarker(marker) {
    this.get('markers').removeObject(marker);
  },

  shouldFit: computed('markersFitMode', function() {
    return Ember.A(['init', 'live']).contains(this.get('markersFitMode'));
  }),

  markersChanged: observer('markers.@each.lat', 'markers.@each.lng', function() {
    if (this.get('markersFitMode') === 'live') {
      run.once(this, 'fitToMarkers');
    }
  }),

  fitToMarkers() {
    const markers = this.get('markers').filter((marker) => {
      return isPresent(marker.get('lat')) && isPresent(marker.get('lng'));
    });

    if (markers.length > 0) {
      const map = this.get('map');
      const bounds = new google.maps.LatLngBounds();
      const points = markers.map((marker) => {
        return new google.maps.LatLng(marker.get('lat'), marker.get('lng'));
      });

      points.forEach((point) => bounds.extend(point));
      map.fitBounds(bounds);
    }
  },

  groupMarkerClicked(marker, group) {
    let markers = this.get('markers').without(marker).filterBy('group', group);
    markers.forEach((marker) => marker.closeInfowindow());
  },

  attachEvents() {
    const events = this.get('events');

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (isPresent(this.get(event))) {
        this.addListener(event);
      }
    }
  },

  addListener(event) {
    const map = this.get('map');

    if (isPresent(map)) {
      google.maps.event.addListener(map, event, () => {
        const action = this.get(event);

        if (typeOf(action) === 'function') {
          action();
        } else {
          this.sendAction(action);
        }
      });
    }
  },

  detachEvents() {
    const map = this.get('map');
    const events = this.get('events');

    if (isPresent(map)) {
      for (let i = 0; i < events.length; i++) {
        google.maps.event.clearListeners(map, events[i]);
      }
    }
  }
});
