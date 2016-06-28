import Ember from 'ember';
import layout from '../templates/components/g-map-polyline';
import GMapComponent from './g-map';
import compact from '../utils/compact';

const { isEmpty, isPresent, observer, computed, run, assert, typeOf } = Ember;

const allowedPolylineOptions = Ember.A(['strokeColor', 'strokeWeight', 'strokeOpacity', 'zIndex', 'geodesic', 'clickable', 'draggable', 'visible']);

const GMapPolylineComponent = Ember.Component.extend({
  layout: layout,
  classNames: ['g-map-polyline'],

  map: computed.alias('mapContext.map'),

  init() {
    this._super(arguments);
    this.infowindow = null;
    this.set('coordinates', Ember.A());
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
      const options = compact(this.getProperties(allowedPolylineOptions));
      const polyline = new google.maps.Polyline(options);
      this.set('polyline', polyline);
    }
    this.setMap();
    this.setPath();
    this.updatePolylineOptions();
    this.setOnClick();
    this.setOnDrag();
  },

  willDestroyElement() {
    this.unsetPolylineFromMap();
    this.get('mapContext').unregisterPolyline(this);
  },

  registerCoordinate(coordinate) {
    this.get('coordinates').addObject(coordinate);
  },

  unregisterCoordinate(coordinate) {
    this.get('coordinates').removeObject(coordinate);
    this.setPath();
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

  setPath() {
    const polyline = this.get('polyline');
    const coordinates = this.get('coordinates');

    if (isPresent(polyline) && isPresent(coordinates)) {
      let coordArray = Ember.A(this.get('coordinates').mapBy('coordinate')).compact();
      polyline.setPath(coordArray);
    }
  },

  polylineOptionsChanged: observer(...allowedPolylineOptions, function() {
    run.once(this, 'updatePolylineOptions');
  }),

  updatePolylineOptions() {
    const polyline = this.get('polyline');
    const options = compact(this.getProperties(allowedPolylineOptions));

    if (isPresent(polyline) && isPresent(Object.keys(options))) {
      polyline.setOptions(options);
    }
  },

  setOnClick() {
    const polyline = this.get('polyline');
    if (isPresent(polyline)) {
      polyline.addListener('click', (e) => this.sendOnClick(e));
    }
  },

  sendOnClick(e) {
    const { onClick } = this.attrs;
    const polyline = this.get('polyline');

    if (typeOf(onClick) === 'function') {
      onClick(e, polyline);
    } else {
      this.sendAction('onClick', e, polyline);
    }
  },

  setOnDrag() {
    const polyline = this.get('polyline');
    if (isPresent(polyline)) {
      polyline.addListener('dragend', (e) => this.sendOnDrag(e));
    }
  },

  sendOnDrag(e) {
    const { onDrag } = this.attrs;
    const polyline = this.get('polyline');

    if (typeOf(onDrag) === 'function') {
      onDrag(e, polyline);
    } else {
      this.sendAction('onDrag', e, polyline);
    }
  }
});

GMapPolylineComponent.reopenClass({
  positionalParams: ['mapContext']
});

export default GMapPolylineComponent;
