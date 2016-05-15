import Ember from 'ember';
import layout from '../templates/components/g-map-polyline-coordinate';
import GMapPolylineComponent from './g-map-polyline';

const { isEmpty, isPresent, observer, computed, run, assert } = Ember;

const GMapPolylineCoordinateComponent = Ember.Component.extend({
  layout: layout,
  classNames: ['g-map-polyline-coordinate'],

  polyline: computed.alias('polylineContext.polyline'),

  init() {
    this._super(arguments);

    const polylineContext = this.get('polylineContext');
    assert('Must be inside {{#g-map-polyline}} component with context set',
      polylineContext instanceof GMapPolylineComponent);

    polylineContext.registerCoordinate(this);
  },

  didInsertElement() {
    this._super();
    if (isEmpty(this.get('coordinate'))) {
      const coordinate = new google.maps.LatLng();
      this.set('coordinate', coordinate);
    }
    this.setPosition();
  },

  willDestroyElement() {
    this.get('polylineContext').unregisterCoordinate(this);
  },

  coordsChanged: observer('lat', 'lng', function() {
    run.once(this, 'setPosition');
  }),

  setPosition() {
    const polylineContext = this.get('polylineContext');
    const lat = this.get('lat');
    const lng = this.get('lng');

    if (isPresent(polylineContext) && isPresent(lat) && isPresent(lng)) {
      const coordinate = new google.maps.LatLng(lat, lng);
      this.set('coordinate', coordinate);
      polylineContext.setPath();
    }
  }
});

GMapPolylineCoordinateComponent.reopenClass({
  positionalParams: ['polylineContext']
});

export default GMapPolylineCoordinateComponent;
