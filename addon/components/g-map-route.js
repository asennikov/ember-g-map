import Ember from 'ember';
import layout from '../templates/components/g-map-route';
import GMapComponent from './g-map';

const { isEmpty, isPresent, observer, computed, run, assert } = Ember;

const GMapRouteComponent = Ember.Component.extend({
  layout: layout,
  classNames: ['g-map-marker'],
  positionalParams: ['mapContext'],

  map: computed.alias('mapContext.map'),

  init() {
    this._super(arguments);
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

    if (isPresent(map) && isEmpty(service) && isEmpty(renderer)) {
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
    }
  },

  onLocationsChanged: observer('originLat', 'originLng', 'destinationLat', 'destinationLng', function() {
    run.once(this, 'updateRoute');
  }),

  updateRoute: function() {
    const service = this.get('directionsService');
    const renderer = this.get('directionsRenderer');
    const originLat = this.get('originLat');
    const originLng = this.get('originLng');
    const destinationLat = this.get('destinationLat');
    const destinationLng = this.get('destinationLng');

    if (isPresent(service) && isPresent(renderer) &&
        isPresent(originLat) && isPresent(originLng) &&
        isPresent(destinationLat) && isPresent(destinationLng)) {
      const origin = new google.maps.LatLng(this.get('originLat'), this.get('originLng'));
      const destination = new google.maps.LatLng(this.get('destinationLat'), this.get('destinationLng'));
      const request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
      };

      service.route(request, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          renderer.setDirections(response);
        }
      });
    }
  }
});

GMapRouteComponent.reopenClass({
  positionalParams: ['mapContext']
});

export default GMapRouteComponent;
