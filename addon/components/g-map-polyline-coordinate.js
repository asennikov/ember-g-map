import Ember from 'ember';
import layout from '../templates/components/g-map-polyline-coordinate';
import GMapPolylineComponent from './g-map-polyline';

const { isEmpty, isPresent, observer, computed, run, assert, typeOf } = Ember;

const GMapPolylineCoordinateComponent = Ember.Component.extend({
  layout: layout,
  classNames: ['g-map-polyline-coordinate'],

  polyline: computed.alias('polylineContext.polyline'),

  init() {
    this._super(arguments);

    const polylineContext = this.get('polylineContext');
    assert('Must be inside {{#g-map-polyline}} component with context set', polylineContext instanceof GMapPolylineComponent);

    polylineContext.registerCoordinate(this);
  },

  coordsChanged: observer('lat', 'lng', function() {
    run.once(this, 'setPosition');
  }),

  setPosition() {
    const polyline = this.get('polyline');
    const lat = this.get('lat');
    const lng = this.get('lng');

    if (isPresent(polyline) && isPresent(lat) && isPresent(lng)) {
      // const position = new google.maps.LatLng(lat, lng);
      polyline.setPath();
    }
  },

GMapPolylineCoordinateComponent.reopenClass({
  positionalParams: ['polylineContext']
});

export default GMapPolylineCoordinateComponent;
