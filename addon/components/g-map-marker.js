import Ember from 'ember';
import layout from '../templates/components/g-map-marker';
import GMapComponent from './g-map';

const { isEmpty, isPresent, observer, computed, run, assert, typeOf } = Ember;

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
    if (isEmpty(this.get('marker')) &&
      (typeof FastBoot === 'undefined')) {
      const marker = new google.maps.Marker();
      this.set('marker', marker);
    }
    this.setPosition();
    this.setIcon();
    this.setLabel();
    this.setTitle();
    this.setMap();
    this.setOnClick();
  },

  willDestroyElement() {
    this.unsetMarkerFromMap();
    this.get('mapContext').unregisterMarker(this);
  },

  registerInfowindow(infowindow, openEvent, closeEvent) {
    this.set('infowindow', infowindow);
    this.attachOpenCloseEvents(infowindow, openEvent, closeEvent);
  },

  unregisterInfowindow() {
    this.set('infowindow', null);
  },

  attachOpenCloseEvents(infowindow, openEvent, closeEvent) {
    const marker = this.get('marker');
    if (openEvent === closeEvent) {
      this.attachTogglingInfowindowEvent(marker, infowindow, openEvent);
    } else {
      this.attachOpenInfowindowEvent(marker, infowindow, openEvent);
      this.attachCloseInfowindowEvent(marker, infowindow, closeEvent);
    }
  },

  attachOpenInfowindowEvent(marker, infowindow, event) {
    if (isPresent(event)) {
      marker.addListener(event, () => infowindow.open());
    }
  },

  attachCloseInfowindowEvent(marker, infowindow, event) {
    if (isPresent(event)) {
      marker.addListener(event, () => infowindow.close());
    }
  },

  attachTogglingInfowindowEvent(marker, infowindow, event) {
    if (isPresent(event)) {
      marker.addListener(event, () => {
        if (infowindow.get('isOpen')) {
          infowindow.close();
        } else {
          infowindow.open();
        }
      });
    }
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

    if (isPresent(marker) &&
        isPresent(lat) &&
        isPresent(lng) &&
        (typeof FastBoot === 'undefined')) {
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

  setOnClick() {
    const marker = this.get('marker');
    if (isPresent(marker)) {
      marker.addListener('click', () => this.sendOnClick());
    }
  },

  labelChanged: observer('label', function() {
    run.once(this, 'setLabel');
  }),

  setLabel() {
    const marker = this.get('marker');
    const label = this.get('label');

    if (isPresent(marker) && isPresent(label)) {
      marker.setLabel(label);
    }
  },

  titleChanged: observer('title', function() {
    run.once(this, 'setTitle');
  }),

  setTitle() {
    const marker = this.get('marker');
    const title = this.get('title');

    if (isPresent(marker) && isPresent(title)) {
      marker.setTitle(title);
    }
  },

  sendOnClick() {
    const { onClick } = this.attrs;
    const mapContext = this.get('mapContext');
    const group = this.get('group');

    if (typeOf(onClick) === 'function') {
      onClick();
    } else {
      this.sendAction('onClick');
    }

    if (isPresent(group)) {
      mapContext.groupMarkerClicked(this, group);
    }
  },

  closeInfowindow() {
    const infowindow = this.get('infowindow');
    if (isPresent(infowindow)) {
      infowindow.close();
    }
  }
});

GMapMarkerComponent.reopenClass({
  positionalParams: ['mapContext']
});

export default GMapMarkerComponent;
