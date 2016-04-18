import Ember from 'ember';
import layout from '../templates/components/g-map-route-waypoint';
import GMapRouteComponent from './g-map-route';

const { isEmpty, isPresent, observer, run, assert } = Ember;

const GMapRouteWaypointComponent = Ember.Component.extend({
  layout: layout,
  classNames: ['g-map-route-waypoint'],

  stopover: true,

  init() {
    this._super(arguments);

    const routeContext = this.get('routeContext');
    const hasRoute = routeContext instanceof GMapRouteComponent;

    assert('Must be inside {{#g-map-route}} component with routeContext set',
      hasRoute);

    this.set('hasRoute', hasRoute);
  },

  didInsertElement() {
    this._super();
    if (isEmpty(this.get('waypoint'))) {
      const waypoint = this.buildWaypoint();
      this.set('waypoint', waypoint);
    }
    this.setRoute();
  },

  willDestroyElement() {
    this.get('routeContext').unregisterWaypoint(this);
  },

  buildWaypoint() {
    const waypoint = {
      location: this.get('address'),
      stopover: this.get('stopover')
    };
    return waypoint;
  },

  routeWasSet: observer('route', function() {
    run.once(this, 'setRoute');
  }),

  setRoute() {
    const routeContext = this.get('routeContext');
    const waypoint = this.get('waypoint');

    if (isPresent(waypoint) && isPresent(routeContext)) {
      routeContext.registerWaypoint(this);
    }
  },

  addressChanged: observer('address', function() {
    run.once(this, 'setAddress');
  }),

  setAddress() {
    const address = this.get('address');
    this.set('waypoint.location', address);
  }
});

GMapRouteWaypointComponent.reopenClass({
  positionalParams: ['routeContext']
});

export default GMapRouteWaypointComponent;
