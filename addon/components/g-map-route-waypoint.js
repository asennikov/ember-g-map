import Ember from 'ember';
import layout from '../templates/components/g-map-route-waypoint';
import GMapRouteComponent from './g-map-route';

const { isEmpty, isPresent, observer, computed, run, assert } = Ember;

const GMapRouteWaypointComponent = Ember.Component.extend({
  layout: layout,
  classNames: ['g-map-route-waypoint'],

  map: computed.alias('routeContext.map'),

  init() {
    this._super(arguments);
    if (isEmpty(this.stopover)) {
      this.stopover = true;
    }

    const routeContext = this.get('routeContext');
    assert('Must be inside {{#g-map-route}} component with routeContext set',
      routeContext instanceof GMapRouteComponent);
  },

  didInsertElement() {
    this._super();
    this.updateWaypoint();
  },

  willDestroyElement() {
    this.get('routeContext').unregisterWaypoint(this);
  },

  coordsChanged: observer('lat', 'lng', function() {
    run.once(this, 'updateWaypoint');
  }),

  updateWaypoint() {
    const { lat, lng } = this.getProperties(['lat', 'lng']);

    if (isPresent(lat) &&
        isPresent(lng) &&
        (typeof FastBoot === 'undefined')) {
      let location = new google.maps.LatLng(lat, lng);
      this.set('waypoint', {
        location: location,
        stopover: this.get('stopover')
      });
    }
  },

  waypointWasSet: observer('waypoint', function() {
    run.once(this, 'updateRoute');
  }),

  updateRoute() {
    const routeContext = this.get('routeContext');
    const waypoint = this.get('waypoint');

    if (isPresent(waypoint) && isPresent(routeContext)) {
      routeContext.registerWaypoint(this);
    }
  }
});

GMapRouteWaypointComponent.reopenClass({
  positionalParams: ['routeContext']
});

export default GMapRouteWaypointComponent;
