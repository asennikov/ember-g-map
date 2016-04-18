import Ember from 'ember';
import layout from '../templates/components/g-map-route-waypoint';
import GMapRouteComponent from './g-map-route';

const { isEmpty, isPresent, observer, computed, run, assert } = Ember;

const GMapRouteWaypointComponent = Ember.Component.extend({
  layout: layout,
  classNames: ['g-map-route-waypoint'],

  stopover: true,

  map: computed.alias('routeContext.mapContext.map'),

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

    this.initPlacesService();
  },

  initPlacesService: Ember.observer('map', function() {
    const map = this.get('map');
    let service = this.get('placesService');

    if (isPresent(map) && isEmpty(service)) {
      service = new google.maps.places.PlacesService(map);
      this.set('placesService', service);

      this.searchLocation();
    }
  }),

  willDestroyElement() {
    this.get('routeContext').unregisterWaypoint(this);
  },

  onAddressChanged: observer('address', function() {
    run.once(this, 'searchLocation');
  }),

  searchLocation() {
    const service = this.get('placesService');
    const address = this.get('address');

    if (isPresent(service) && isPresent(address)) {
      const request = { query: address };

      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          this.updateLocation(results);
        }
      });
    }
  },

  updateLocation(results) {
    const lat = results[0].geometry.location.lat();
    const lng = results[0].geometry.location.lng();

    this.set('lat', lat);
    this.set('lng', lng);

    this.set('waypoint', this.buildWaypoint());
  },

  buildWaypoint() {
    let lat = this.get('lat');
    let lng = this.get('lng');
    let location = new google.maps.LatLng(lat, lng);

    const waypoint = {
      location: location,
      stopover: this.get('stopover')
    };

    return waypoint;
  },

  waypointWasSet: observer('waypoint', function() {
    run.once(this, 'setRoute');
  }),

  setRoute() {
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
