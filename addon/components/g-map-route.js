import Ember from 'ember';
import layout from '../templates/components/g-map-route';
import GMapComponent from 'ember-g-map/components/g-map';

const { isEmpty, isPresent, observer, computed, run, assert } = Ember;

export default Ember.Component.extend({
  layout: layout,
  classNames: ['g-map-marker'],

  map: computed.alias('parentView.map'),

  init() {
    this._super(arguments);
    let parent = this.get('parentView');
    assert('Must be inside {{#g-map}} component', parent instanceof GMapComponent);
  },

  didInsertElement() {
    this._super();
    this.initDirectionsService();
  },

  willDestroyElement() {
    let renderer = this.get('directionsRenderer');
    if (isPresent(renderer)) {
      renderer.setMap(null);
    }
  },

  mapWasSet: observer('map', function() {
    run.once(this, 'initDirectionsService');
  }),

  initDirectionsService() {
    let map = this.get('map');
    let service = this.get('directionsService');
    let renderer = this.get('directionsRenderer');

    if (isPresent(map) && isEmpty(service) && isEmpty(renderer)) {
      let rendererOptions = {
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
    let service = this.get('directionsService');
    let renderer = this.get('directionsRenderer');
    let originLat = this.get('originLat');
    let originLng = this.get('originLng');
    let destinationLat = this.get('destinationLat');
    let destinationLng = this.get('destinationLng');

    if (isPresent(service) && isPresent(renderer) &&
        isPresent(originLat) && isPresent(originLng) &&
        isPresent(destinationLat) && isPresent(destinationLng)) {
      let origin = new google.maps.LatLng(this.get('originLat'), this.get('originLng'));
      let destination = new google.maps.LatLng(this.get('destinationLat'), this.get('destinationLng'));
      let request = {
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
