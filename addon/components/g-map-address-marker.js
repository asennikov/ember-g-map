import Ember from 'ember';
import layout from '../templates/components/g-map-address-marker';
/* global google */

const { computed, observer, run, isPresent, isEmpty, typeOf } = Ember;

const GMapAddressMarkerComponent = Ember.Component.extend({
  layout: layout,
  classNames: ['g-map-address-marker'],

  map: computed.alias('mapContext.map'),

  didInsertElement() {
    this._super(...arguments);
    this.initPlacesService();
  },

  mapWasSet: observer('map', function() {
    run.once(this, 'initPlacesService');
  }),

  initPlacesService() {
    const map = this.get('map');
    let service = this.get('placesService');

    if (isPresent(map) &&
      isEmpty(service) &&
      (typeof FastBoot === 'undefined')) {
      service = new google.maps.places.PlacesService(map);
      this.set('placesService', service);
      this.searchLocation();
    }
  },

  onAddressChanged: observer('address', function() {
    run.once(this, 'searchLocation');
  }),

  searchLocation() {
    const service = this.get('placesService');
    const address = this.get('address');

    if (isPresent(service) &&
        isPresent(address) &&
        (typeof FastBoot === 'undefined')) {
      const request = { query: address };

      service.textSearch(request, (results, status) => {
        if (google && status === google.maps.places.PlacesServiceStatus.OK) {
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
    this.sendOnLocationChange(lat, lng, results);
  },

  sendOnLocationChange() {
    const { onLocationChange } = this.attrs;

    if (typeOf(onLocationChange) === 'function') {
      onLocationChange(...arguments);
    } else {
      this.sendAction('onLocationChange', ...arguments);
    }
  }
});

GMapAddressMarkerComponent.reopenClass({
  positionalParams: ['mapContext']
});

export default GMapAddressMarkerComponent;
