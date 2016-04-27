import Ember from 'ember';
import layout from '../templates/components/g-map-polyline';
import GMapComponent from './g-map';

const { isEmpty, isPresent, observer, computed, run, assert, typeOf } = Ember;

const GMapPolylineComponent = Ember.Component.extend({
  layout: layout,
  classNames: ['g-map-polyline'],

  map: computed.alias('mapContext.map'),

  init() {
    this._super(arguments);
    this.infowindow = null;
    if (isEmpty(this.get('group'))) {
      this.set('group', null);
    }

    const mapContext = this.get('mapContext');
    assert('Must be inside {{#g-map}} component with context set', mapContext instanceof GMapComponent);

    mapContext.registerPolyline(this);
  },

  didInsertElement() {
    this._super();
    if (isEmpty(this.get('polyline'))) {
      const polyline = new google.maps.Polyline();
      this.set('polyline', polyline);
    }
    this.setPosition();
    this.setIcon();
    this.setLabel();
    this.setTitle();
    this.setMap();
    this.setOnClick();
  },

  willDestroyElement() {
    this.unsetPolylineFromMap();
    this.get('mapContext').unregisterPolyline(this);
  },

  registerInfowindow(infowindow, openEvent, closeEvent) {
    this.set('infowindow', infowindow);
    this.attachOpenCloseEvents(infowindow, openEvent, closeEvent);
  },

  unregisterInfowindow() {
    this.set('infowindow', null);
  },

  attachOpenCloseEvents(infowindow, openEvent, closeEvent) {
    const polyline = this.get('polyline');
    if (openEvent === closeEvent) {
      this.attachTogglingInfowindowEvent(polyline, infowindow, openEvent);
    } else {
      this.attachOpenInfowindowEvent(polyline, infowindow, openEvent);
      this.attachCloseInfowindowEvent(polyline, infowindow, closeEvent);
    }
  },

  attachOpenInfowindowEvent(polyline, infowindow, event) {
    if (isPresent(event)) {
      polyline.addListener(event, () => infowindow.open());
    }
  },

  attachCloseInfowindowEvent(polyline, infowindow, event) {
    if (isPresent(event)) {
      polyline.addListener(event, () => infowindow.close());
    }
  },

  attachTogglingInfowindowEvent(polyline, infowindow, event) {
    if (isPresent(event)) {
      polyline.addListener(event, () => {
        if (infowindow.get('isOpen')) {
          infowindow.close();
        } else {
          infowindow.open();
        }
      });
    }
  },

  unsetPolylineFromMap() {
    const polyline = this.get('polyline');
    if (isPresent(polyline)) {
      polyline.setMap(null);
    }
  },

  mapWasSet: observer('map', function() {
    run.once(this, 'setMap');
  }),

  setMap() {
    const map = this.get('map');
    const polyline = this.get('polyline');

    if (isPresent(polyline) && isPresent(map)) {
      polyline.setMap(map);
    }
  },

  coordsChanged: observer('lat', 'lng', function() {
    run.once(this, 'setPosition');
  }),

  setPosition() {
    const polyline = this.get('polyline');
    const lat = this.get('lat');
    const lng = this.get('lng');

    if (isPresent(polyline) && isPresent(lat) && isPresent(lng)) {
      const position = new google.maps.LatLng(lat, lng);
      polyline.setPosition(position);
    }
  },

  iconChanged: observer('icon', function() {
    run.once(this, 'setIcon');
  }),

  setIcon() {
    const polyline = this.get('polyline');
    const icon = this.get('icon');

    if (isPresent(polyline) && isPresent(icon)) {
      polyline.setIcon(icon);
    }
  },

  setOnClick() {
    const polyline = this.get('polyline');
    if (isPresent(polyline)) {
      polyline.addListener('click', () => this.sendOnClick());
    }
  },

  labelChanged: observer('label', function() {
    run.once(this, 'setLabel');
  }),

  setLabel() {
    const polyline = this.get('polyline');
    const label = this.get('label');

    if (isPresent(polyline) && isPresent(label)) {
      polyline.setLabel(label);
    }
  },

  titleChanged: observer('title', function() {
    run.once(this, 'setTitle');
  }),

  setTitle() {
    const polyline = this.get('polyline');
    const title = this.get('title');

    if (isPresent(polyline) && isPresent(title)) {
      polyline.setTitle(title);
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
      mapContext.groupPolylineClicked(this, group);
    }
  },

  closeInfowindow() {
    const infowindow = this.get('infowindow');
    if (isPresent(infowindow)) {
      infowindow.close();
    }
  }
});

GMapPolylineComponent.reopenClass({
  positionalParams: ['mapContext']
});

export default GMapPolylineComponent;
