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

    let mapContext = this.get('mapContext');
    let hasMap = mapContext instanceof GMapComponent;
    let hasMarker = mapContext instanceof GMapMarkerComponent;
    assert('Must be inside {{#g-map}} or {{#g-map-marker}} components with context set',
      hasMarker || hasMap);

    this.set('hasMarker', hasMarker);
  },

  didInsertElement() {
    this._super();
    if (isEmpty(this.get('infowindow'))) {
      let infowindow = this.buildInfowindow();
      this.set('infowindow', infowindow);
    }
    this.setPosition();
    this.setMap();
    this.setMarker();
  },

  willDestroyElement() {
    this.close();
  },

  buildInfowindow() {
    let infowindow = new google.maps.InfoWindow({
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
    let infowindow = this.get('infowindow');
    if (isPresent(infowindow)) {
      infowindow.close();
    }
  },

  mapWasSet: observer('map', function() {
    run.once(this, 'setMap');
  }),

  setMap() {
    let map = this.get('map');
    let hasMarker = this.get('hasMarker');
    let infowindow = this.get('infowindow');

    if (isPresent(infowindow) && isPresent(map) && !hasMarker) {
      infowindow.open(map);
    }
  },

  markerWasSet: observer('marker', function() {
    run.once(this, 'setMarker');
  }),

  setMarker() {
    let map = this.get('map');
    let marker = this.get('marker');
    let infowindow = this.get('infowindow');

    if (isPresent(infowindow) && isPresent(map) && isPresent(marker)) {
      marker.addListener('click', () => infowindow.open(map, marker));
    }
  },

  coordsChanged: observer('lat', 'lng', function() {
    run.once(this, 'setPosition');
  }),

  setPosition() {
    let infowindow = this.get('infowindow');
    let lat = this.get('lat');
    let lng = this.get('lng');

    if (isPresent(infowindow) && isPresent(lat) && isPresent(lng)) {
      let position = new google.maps.LatLng(lat, lng);
      infowindow.setPosition(position);
    }
  }
});

GMapInfowindowComponent.reopenClass({
  positionalParams: ['mapContext']
});

export default GMapInfowindowComponent;
