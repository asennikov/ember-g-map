import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { isPresent, isEmpty } from '@ember/utils';
import { observer } from '@ember/object';
import { run } from '@ember/runloop';
import { assert } from '@ember/debug';
import layout from '../templates/components/g-map-polyline-coordinate';
import GMapPolylineComponent from './g-map-polyline';

const GMapPolylineCoordinateComponent = Component.extend({
  layout,
  classNames: ['g-map-polyline-coordinate'],

  polyline: alias('polylineContext.polyline'),

  init() {
    this._super(...arguments);

    const polylineContext = this.get('polylineContext');
    assert('Must be inside {{#g-map-polyline}} component with context set',
      polylineContext instanceof GMapPolylineComponent);

    polylineContext.registerCoordinate(this);
  },

  didInsertElement() {
    this._super(...arguments);
    if (isEmpty(this.get('coordinate'))
      && (typeof google !== 'undefined')) {
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

    if (isPresent(polylineContext)
      && isPresent(lat)
      && isPresent(lng)
      && (typeof google !== 'undefined')) {
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
