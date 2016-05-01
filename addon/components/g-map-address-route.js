import Ember from 'ember';
import layout from '../templates/components/g-map-address-route';

const { observer, run, typeOf, inject } = Ember;

const GMapAddressRouteComponent = Ember.Component.extend({
  layout: layout,
  classNames: ['g-map-address-route'],

  places: inject.service(),

  didInsertElement() {
    this._super();
    this.searchLocations();
  },

  onAddressChanged: observer('originAddress', 'destinationAddress', function() {
    run.once(this, 'searchLocations');
  }),

  searchLocations() {
    const originAddress = this.get('originAddress');
    const destinationAddress = this.get('destinationAddress');

    this.get('places').search(originAddress)
      .then((lat, lng, results) => this.updateOriginLocation(lat, lng, results));

    this.get('places').search(destinationAddress)
      .then((lat, lng, results) => this.updateDestinationLocation(lat, lng, results));
  },

  updateOriginLocation(lat, lng, results) {
    this.setProperties({ originLat: lat, originLng: lng });
    this.sendOnLocationsChange(lat, lng, results);
  },

  updateDestinationLocation(lat, lng, results) {
    this.setProperties({ destinationLat: lat, destinationLng: lng });
    this.sendOnLocationsChange(lat, lng, results);
  },

  sendOnLocationsChange(lat, lng, results) {
    const { onLocationsChange } = this.attrs;

    if (typeOf(onLocationsChange) === 'function') {
      onLocationsChange(lat, lng, results);
    } else {
      this.sendAction('onLocationsChange', lat, lng, results);
    }
  }
});

GMapAddressRouteComponent.reopenClass({
  positionalParams: ['mapContext']
});

export default GMapAddressRouteComponent;
