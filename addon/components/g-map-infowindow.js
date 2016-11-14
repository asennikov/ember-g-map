import Ember from 'ember';
import layout from '../templates/components/g-map-infowindow';
import GMapComponent from './g-map';
import GMapMarkerComponent from './g-map-marker';
import compact from '../utils/compact';

const { isEmpty, isPresent, computed, run, assert, typeOf } = Ember;

const allowedOptions = Ember.A(['disableAutoPan', 'maxWidth', 'pixelOffset']);

const OPEN_CLOSE_EVENTS = Ember.A(
  [ 'click', 'dblclick', 'rightclick', 'mouseover', 'mouseout' ]
);

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
  },

  didRender() {
    this.setPosition();
    this.setMap();
    this.setOptions();
    if (this.get('open')) {
      this._open();
    } else {
      this._close();
    }
  },

  willDestroyElement() {
    this._close();
  },

  setOptions() {
    const infowindow = this.get('infowindow');
    const options = compact(this.getProperties(allowedOptions));

    if (isPresent(infowindow) && isPresent(Object.keys(options))) {
      infowindow.setOptions(options);
    }
  },

  buildInfowindow() {
    if (google) {
      const infowindow = new google.maps.InfoWindow({
        content: this.get('element')
      });

      if (isPresent(this.get('attrs.onClose'))) {
        infowindow.addListener('closeclick', () => this.handleCloseClickEvent());
      }
      return infowindow;
    }
  },

  handleCloseClickEvent() {
    const { onClose } = this.attrs;
    if (typeOf(onClose) === 'function') {
      onClose();
    } else {
      this.sendAction('onClose');
    }
  },

  _open() {
    const infowindow = this.get('infowindow');
    const map = this.get('map');
    const marker = this.get('marker');

    this.set('isOpen', true);
    if (isPresent(map) && isPresent(marker)) {
      infowindow.open(map, marker);
    } else if (isPresent(map)) {
      infowindow.open(map);
    }
  },

  _close() {
    const infowindow = this.get('infowindow');
    if (isPresent(infowindow)) {
      this.set('isOpen', false);
      infowindow.close();
    }
  },

  setMap() {
    if (this.get('hasMarker') === false) {
      this._open();
    }
  },

  setPosition() {
    const infowindow = this.get('infowindow');
    const lat = this.get('lat');
    const lng = this.get('lng');

    if (isPresent(infowindow) &&
        isPresent(lat) &&
        isPresent(lng) &&
        (typeof FastBoot === 'undefined')) {
      const position = new google.maps.LatLng(lat, lng);
      infowindow.setPosition(position);
    }
  },

  retrieveOpenEvent() {
    const openEvent = this.get('openOn');
    return OPEN_CLOSE_EVENTS.includes(openEvent) ? openEvent : 'click';
  },

  retrieveCloseEvent() {
    const closeEvent = this.get('closeOn');
    return OPEN_CLOSE_EVENTS.includes(closeEvent) ? closeEvent : null;
  }
});

GMapInfowindowComponent.reopenClass({
  positionalParams: ['mapContext']
});

export default GMapInfowindowComponent;
