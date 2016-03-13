import Ember from 'ember';
import layout from '../templates/components/g-map-address-route';
import GMapComponent from './g-map';

const { isEmpty, isPresent, observer, computed, run, assert } = Ember;

const TRAVEL_MODES = {
  walking: google.maps.TravelMode.WALKING,
  bicycling: google.maps.TravelMode.BICYCLING,
  transit: google.maps.TravelMode.TRANSIT,
  driving: google.maps.TravelMode.DRIVING
};

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

  onLocationsChanged: observer('originAddress', 'destinationAddress', 'travelMode', function() {
    run.once(this, 'updateRoute');
  }),

  updateRoute: function() {
    const service = this.get('directionsService');
    const renderer = this.get('directionsRenderer');
    const originAddress = this.get('originAddress');
    const destinationAddress = this.get('destinationAddress');

    if (isPresent(service) && isPresent(renderer) &&
      isPresent(originAddress) && isPresent(destinationAddress)) {
      const origin = originAddress;
      const destination = destinationAddress;
      const travelMode = this.retrieveTravelMode(this.get('travelMode'));
      const request = {
        origin: origin,
        destination: destination,
        travelMode: travelMode
      };

      service.route(request, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          renderer.setDirections(response);
        }
      });
    }
  },

  retrieveTravelMode(mode) {
    return TRAVEL_MODES.hasOwnProperty(mode) ? TRAVEL_MODES[mode] : TRAVEL_MODES.driving;
  }
});

GMapRouteComponent.reopenClass({
  positionalParams: ['mapContext']
});

export default GMapRouteComponent;
