import Ember from 'ember';
import layout from '../templates/components/g-map-address-marker';
/* global google */

const { computed, observer, run, isPresent, isEmpty } = Ember;

const GMapAddressMarkerComponent = Ember.Component.extend({
  layout: layout,
  classNames: ['g-map-address-marker'],

  map: computed.alias('mapContext.map'),

  didInsertElement() {
    this._super();
    this.initPlacesService();
  },

  mapWasSet: observer('map', function() {
    run.once(this, 'initPlacesService');
  }),

  initPlacesService() {
    const map = this.get('map');
    let service = this.get('placesService');

    if (isPresent(map) && isEmpty(service)) {
      service = new google.maps.places.PlacesService(map);
      this.set('placesService', service);
      this.updateLocation();
    }
  },

  onAddressChanged: observer('address', function() {
    run.once(this, 'updateLocation');
  }),

  updateLocation() {
    const service = this.get('placesService');
    const address = this.get('address');

    if (isPresent(service) && isPresent(address)) {
      const request = { query: address };

      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          this.set('lat', results[0].geometry.location.lat());
          this.set('lng', results[0].geometry.location.lng());
        }
      });
    }
  }
});

GMapAddressMarkerComponent.reopenClass({
  positionalParams: ['mapContext']
});

export default GMapAddressMarkerComponent;
