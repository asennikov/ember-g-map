import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { observer } from '@ember/object';
import { run } from '@ember/runloop';
import { typeOf, isEmpty, isPresent } from '@ember/utils';
import layout from '../templates/components/g-map-address-route';

const GMapAddressRouteComponent = Component.extend({
  layout,
  classNames: ['g-map-address-route'],

  map: alias('mapContext.map'),

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

    if (isPresent(map)
      && isEmpty(service)
      && (typeof FastBoot === 'undefined')) {
      service = new google.maps.places.PlacesService(map);
      this.set('placesService', service);
      this.searchLocations();
    }
  },

  onAddressChanged: observer('originAddress', 'destinationAddress', function() {
    run.once(this, 'searchLocations');
  }),

  searchLocations() {
    const service = this.get('placesService');
    const originAddress = this.get('originAddress');
    const destinationAddress = this.get('destinationAddress');

    if (isPresent(service)
      && isPresent(originAddress)
      && (typeof FastBoot === 'undefined')) {
      const originRequest = { query: originAddress };

      service.textSearch(originRequest, (results, status) => {
        if (google && status === google.maps.places.PlacesServiceStatus.OK) {
          this.updateOriginLocation(results);
        }
      });
    }

    if (isPresent(service)
      && isPresent(destinationAddress)
      && (typeof FastBoot === 'undefined')) {
      const destinationRequest = { query: destinationAddress };

      service.textSearch(destinationRequest, (results, status) => {
        if (google && status === google.maps.places.PlacesServiceStatus.OK) {
          this.updateDestinationLocation(results);
        }
      });
    }
  },

  updateOriginLocation(results) {
    if (!this.isDestroyed) {
      const lat = results[0].geometry.location.lat();
      const lng = results[0].geometry.location.lng();

      this.set('originLat', lat);
      this.set('originLng', lng);
      this.sendOnLocationsChange(lat, lng, results);
    }
  },

  updateDestinationLocation(results) {
    if (!this.isDestroyed) {
      const lat = results[0].geometry.location.lat();
      const lng = results[0].geometry.location.lng();

      this.set('destinationLat', lat);
      this.set('destinationLng', lng);
      this.sendOnLocationsChange(lat, lng, results);
    }
  },

  sendOnLocationsChange() {
    const { onLocationsChange } = this.attrs;

    if (typeOf(onLocationsChange) === 'function') {
      onLocationsChange(...arguments);
    } else {
      this.sendAction('onLocationsChange', ...arguments);
    }
  }
});

GMapAddressRouteComponent.reopenClass({
  positionalParams: ['mapContext']
});

export default GMapAddressRouteComponent;
