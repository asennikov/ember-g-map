import Ember from 'ember';
import layout from '../templates/components/g-map-marker';
import GMapComponent from './g-map';

const { isEmpty, isPresent, observer, computed, run, assert } = Ember;

const GMapMarkerComponent = Ember.Component.extend({
  layout: layout,
  classNames: ['g-map-marker'],

  map: computed.alias('mapContext.map'),

  init() {
    this._super(arguments);
    this.infowindow = null;
    if (isEmpty(this.get('group'))) {
      this.set('group', null);
    }

    const mapContext = this.get('mapContext');
    assert('Must be inside {{#g-map}} component with context set', mapContext instanceof GMapComponent);

    mapContext.registerMarker(this);
  },

  didInsertElement() {
    this._super();
    if (isEmpty(this.get('marker'))) {
      const marker = new google.maps.Marker();
      this.set('marker', marker);
    }
    this.setPosition();
    this.setIcon();
    this.setMap();
    this.setGroup();
  },

  willDestroyElement() {
    this.unsetMarkerFromMap();
    this.get('mapContext').unregisterMarker(this);
  },

  registerInfowindow(infowindow) {
    this.set('infowindow', infowindow);
  },

  unregisterInfowindow() {
    this.set('infowindow', null);
  },

  unsetMarkerFromMap() {
    const marker = this.get('marker');
    if (isPresent(marker)) {
      marker.setMap(null);
    }
  },

  mapWasSet: observer('map', function() {
    run.once(this, 'setMap');
  }),

  setMap() {
    const map = this.get('map');
    const marker = this.get('marker');

    if (isPresent(marker) && isPresent(map)) {
      marker.setMap(map);
    }
  },

  coordsChanged: observer('lat', 'lng', function() {
    run.once(this, 'setPosition');
  }),

  setPosition() {
    const marker = this.get('marker');
    const lat = this.get('lat');
    const lng = this.get('lng');

    if (isPresent(marker) && isPresent(lat) && isPresent(lng)) {
      const position = new google.maps.LatLng(lat, lng);
      marker.setPosition(position);
    }
  },

  iconChanged: observer('icon', function() {
    run.once(this, 'setIcon');
  }),

  setIcon() {
    const marker = this.get('marker');
    const icon = this.get('icon');

    if (isPresent(marker) && isPresent(icon)) {
      marker.setIcon(icon);
    }
  },

  groupChanged: observer('group', function() {
    run.once(this, 'setGroup');
  }),

  setGroup() {
    const marker = this.get('marker');
    const mapContext = this.get('mapContext');
    const group = this.get('group');

    if (isPresent(marker) && isPresent(group)) {
      marker.addListener('click', () => mapContext.groupMarkerClicked(this, group));
    }
  },

  closeInfowindow() {
    const infowindow = this.get('infowindow');
    if (isPresent('infowindow')) {
      infowindow.close();
    }
  }
});

GMapMarkerComponent.reopenClass({
  positionalParams: ['mapContext']
});

export default GMapMarkerComponent;
