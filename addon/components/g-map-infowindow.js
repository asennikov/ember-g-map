import Ember from 'ember';
import layout from '../templates/components/g-map-infowindow';
import GMapComponent from './g-map';
import GMapMarkerComponent from './g-map-marker';

const { isEmpty, isPresent, observer, computed, run, assert, typeOf } = Ember;

const GMapInfowindowComponent = Ember.Component.extend({
  layout: layout,
  classNames: ['g-map-marker'],

  map: computed.alias('mapContext.map'),
  marker: computed.alias('mapContext.marker'),

  init() {
    this._super(arguments);

    const mapContext = this.get('mapContext');
    const hasMap = mapContext instanceof GMapComponent;
    const hasMarker = mapContext instanceof GMapMarkerComponent;
    assert('Must be inside {{#g-map}} or {{#g-map-marker}} components with context set',
      hasMarker || hasMap);

    this.set('hasMarker', hasMarker);
  },

  didInsertElement() {
    this._super();
    if (isEmpty(this.get('infowindow'))) {
      const infowindow = this.buildInfowindow();
      this.set('infowindow', infowindow);
    }
    this.setPosition();
    this.setMap();
    this.setMarker();
  },

  willDestroyElement() {
    this.close();

    if (this.get('hasMarker')) {
      this.get('mapContext').unregisterInfowindow();
    }
  },

  buildInfowindow() {
    const infowindow = new google.maps.InfoWindow({
      content: this.get('element'),
      disableAutoPan: true
    });

    if (isPresent(this.get('attrs.onClose'))) {
      this.attachCloseEvent(infowindow);
    }
    return infowindow;
  },

  attachCloseEvent(infowindow) {
    infowindow.addListener('closeclick', () => {
      const { onClose } = this.attrs;
      if (typeOf(onClose) === 'function') {
        onClose();
      } else {
        this.sendAction('onClose');
      }
    });
  },

  close() {
    const infowindow = this.get('infowindow');
    if (isPresent(infowindow)) {
      infowindow.close();
    }
  },

  mapWasSet: observer('map', function() {
    run.once(this, 'setMap');
  }),

  setMap() {
    const map = this.get('map');
    const hasMarker = this.get('hasMarker');
    const infowindow = this.get('infowindow');

    if (isPresent(infowindow) && isPresent(map) && !hasMarker) {
      infowindow.open(map);
    }
  },

  markerWasSet: observer('marker', function() {
    run.once(this, 'setMarker');
  }),

  setMarker() {
    const map = this.get('map');
    const marker = this.get('marker');
    const context = this.get('mapContext');
    const infowindow = this.get('infowindow');

    if (isPresent(infowindow) && isPresent(map) && isPresent(marker)) {
      context.registerInfowindow(this);
      marker.addListener('click', () => infowindow.open(map, marker));
    }
  },

  coordsChanged: observer('lat', 'lng', function() {
    run.once(this, 'setPosition');
  }),

  setPosition() {
    const infowindow = this.get('infowindow');
    const lat = this.get('lat');
    const lng = this.get('lng');

    if (isPresent(infowindow) && isPresent(lat) && isPresent(lng)) {
      const position = new google.maps.LatLng(lat, lng);
      infowindow.setPosition(position);
    }
  }
});

GMapInfowindowComponent.reopenClass({
  positionalParams: ['mapContext']
});

export default GMapInfowindowComponent;
