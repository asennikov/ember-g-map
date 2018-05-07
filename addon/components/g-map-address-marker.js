import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { observer } from '@ember/object';
import { run } from '@ember/runloop';
import { typeOf, isEmpty, isPresent } from '@ember/utils';
import layout from '../templates/components/g-map-address-marker';

const GMapAddressMarkerComponent = Component.extend({
  layout,
  classNames: ['g-map-address-marker'],

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
      this.searchLocation();
    }
  },

  onAddressChanged: observer('address', function() {
    run.once(this, 'searchLocation');
  }),

  searchLocation() {
    const service = this.get('placesService');
    const address = this.get('address');

    if (isPresent(service)
      && isPresent(address)
      && (typeof FastBoot === 'undefined')) {
      const request = { query: address };

      service.textSearch(request, (results, status) => {
        if (google && status === google.maps.places.PlacesServiceStatus.OK) {
          this.updateLocation(results);
        }
      });
    }
  },

  updateLocation(results) {
    if (!this.destroyed) {
      const lat = results[0].geometry.location.lat();
      const lng = results[0].geometry.location.lng();
      const { viewport } = results[0].geometry;

      this.set('lat', lat);
      this.set('lng', lng);
      this.set('viewport', viewport);
      this.sendOnLocationChange(lat, lng, results);
    }
  },

  sendOnLocationChange() {
    const onLocationChange = this.get('onLocationChange');

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
