import Ember from 'ember';
import layout from '../templates/components/g-map-route';
import GMapComponent from './g-map';
import compact from '../utils/compact';

const { isEmpty, isPresent, observer, computed, run, assert } = Ember;

const allowedPolylineOptions = Ember.A(['strokeColor', 'strokeWeight', 'strokeOpacity', 'zIndex']);

const TRAVEL_MODES = {
  walking: Ember.get(window, 'google.maps.TravelMode.WALKING'),
  bicycling: Ember.get(window, 'google.maps.TravelMode.BICYCLING'),
  transit: Ember.get(window, 'google.maps.TravelMode.TRANSIT'),
  driving: Ember.get(window, 'google.maps.TravelMode.DRIVING')
};

const GMapRouteComponent = Ember.Component.extend({
  layout: layout,
  classNames: ['g-map-marker'],
  positionalParams: ['mapContext'],

  map: computed.alias('mapContext.map'),

  init() {
    this._super(arguments);
    this.set('waypoints', Ember.A());
    const mapContext = this.get('mapContext');
    assert('Must be inside {{#g-map}} component with context set', mapContext instanceof GMapComponent);
  },

  didInsertElement() {
    this._super();
    this.initDirectionsService();
  },

  willDestroyElement() {
    const renderer = this.get('directionsRenderer');
    if (isPresent(renderer)) {
      renderer.setMap(null);
    }
  },

  mapWasSet: observer('map', function() {
    run.once(this, 'initDirectionsService');
  }),

  initDirectionsService() {
    const map = this.get('map');
    let service = this.get('directionsService');
    let renderer = this.get('directionsRenderer');

    if (isPresent(map) &&
        isEmpty(service) &&
        isEmpty(renderer) &&
        (typeof FastBoot === 'undefined')) {
      const rendererOptions = {
        map: map,
        suppressMarkers: true,
        preserveViewport: true
      };
      renderer = new google.maps.DirectionsRenderer(rendererOptions);
      service = new google.maps.DirectionsService();

      this.set('directionsRenderer', renderer);
      this.set('directionsService', service);

      this.updateRoute();
      this.updatePolylineOptions();
    }
  },

  onLocationsChanged: observer('originLat', 'originLng', 'destinationLat', 'destinationLng', 'travelMode', function() {
    run.once(this, 'updateRoute');
  }),

  updateRoute() {
    const service = this.get('directionsService');
    const renderer = this.get('directionsRenderer');
    const originLat = this.get('originLat');
    const originLng = this.get('originLng');
    const destinationLat = this.get('destinationLat');
    const destinationLng = this.get('destinationLng');
    const waypoints = this.get('waypoints').mapBy('waypoint');

    if (isPresent(service) && isPresent(renderer) &&
      isPresent(originLat) && isPresent(originLng) &&
      isPresent(destinationLat) && isPresent(destinationLng) &&
      (typeof FastBoot === 'undefined')) {
      const origin = new google.maps.LatLng(this.get('originLat'), this.get('originLng'));
      const destination = new google.maps.LatLng(this.get('destinationLat'), this.get('destinationLng'));
      const travelMode = this.retrieveTravelMode(this.get('travelMode'));
      const request = {
        origin: origin,
        destination: destination,
        travelMode: travelMode,
        waypoints: waypoints
      };

      service.route(request, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          renderer.setDirections(response);
        }
      });
    }
  },

  polylineOptionsChanged: observer(...allowedPolylineOptions, function() {
    run.once(this, 'updatePolylineOptions');
  }),

  updatePolylineOptions() {
    const renderer = this.get('directionsRenderer');
    const polylineOptions = compact(this.getProperties(allowedPolylineOptions));

    if (isPresent(renderer) && isPresent(Object.keys(polylineOptions))) {
      renderer.setOptions({ polylineOptions });

      const directions = renderer.getDirections();
      if (isPresent(directions)) {
        renderer.setDirections(directions);
      }
    }
  },

  retrieveTravelMode(mode) {
    return TRAVEL_MODES.hasOwnProperty(mode) ? TRAVEL_MODES[mode] : TRAVEL_MODES.driving;
  },

  registerWaypoint(waypoint) {
    this.get('waypoints').addObject(waypoint);
  },

  unregisterWaypoint(waypoint) {
    this.get('waypoints').removeObject(waypoint);
  },

  waypointsChanged: observer('waypoints.@each.location', function() {
    run.once(this, 'updateRoute');
  })
});

GMapRouteComponent.reopenClass({
  positionalParams: ['mapContext']
});

export default GMapRouteComponent;
