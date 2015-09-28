import Ember from 'ember';
import layout from '../templates/components/g-map-marker';
import GMapComponent from './g-map';

const { isEmpty, isPresent, observer, computed, run, assert } = Ember;

export default Ember.Component.extend({
  layout: layout,
  classNames: ['g-map-marker'],
  positionalParams: ['mapContext'],

  map: computed.alias('mapContext.map'),

  init() {
    this._super(arguments);

    let mapContext = this.get('mapContext');
    assert('Must be inside {{#g-map}} component with context set', mapContext instanceof GMapComponent);

    let markers = mapContext.get('markers');
    markers.pushObject(this);

    if (isEmpty(this.get('withInfowindow'))) {
      this.set('withInfowindow', false);
    }
  },

  didInsertElement() {
    this._super();
    if (isEmpty(this.get('marker'))) {
      let marker = new google.maps.Marker();
      this.set('marker', marker);
    }
    this.setPosition();
    this.setIcon();
    this.setMap();
  },

  willDestroyElement() {
    let marker = this.get('marker');
    if (isPresent(marker)) {
      marker.setMap(null);
    }
    let markers = this.get('mapContext.markers');
    markers.removeObject(this);
  },

  mapWasSet: observer('map', function() {
    run.once(this, 'setMap');
  }),

  setMap() {
    let map = this.get('map');
    let marker = this.get('marker');

    if (isPresent(marker) && isPresent(map)) {
      marker.setMap(map);
      if (this.get('withInfowindow')) {
        this.setInfowindow();
      }
    }
  },

  setInfowindow() {
    let map = this.get('map');
    let marker = this.get('marker');

    if (isPresent(marker) && isPresent(map)) {
      let infowindow = new google.maps.InfoWindow({
        content: this.get('element')
      });
      marker.addListener('click', function() {
        infowindow.open(map, marker);
      });
    }
  },

  coordsChanged: observer('lat', 'lng', function() {
    run.once(this, 'setPosition');
  }),

  setPosition() {
    let marker = this.get('marker');
    let lat = this.get('lat');
    let lng = this.get('lng');

    if (isPresent(marker) && isPresent(lat) && isPresent(lng)) {
      let position = new google.maps.LatLng(lat, lng);
      marker.setPosition(position);
    }
  },

  iconChanged: observer('icon', function() {
    run.once(this, 'setIcon');
  }),

  setIcon() {
    let marker = this.get('marker');
    let icon = this.get('icon');

    if (isPresent(marker) && isPresent(icon)) {
      marker.setIcon(icon);
    }
  }
});
