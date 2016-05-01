import Ember from 'ember';
import layout from '../templates/components/g-map-address-marker';

const { observer, run, typeOf, inject } = Ember;

const GMapAddressMarkerComponent = Ember.Component.extend({
  layout: layout,
  classNames: ['g-map-address-marker'],

  places: inject.service(),

  didInsertElement() {
    this._super(...arguments);
    this.searchLocation();
  },

  onAddressChanged: observer('address', function() {
    run.once(this, 'searchLocation');
  }),

  searchLocation() {
    const address = this.get('address');
    this.get('places').search(address)
      .then((lat, lng, results) => this.updateLocation(lat, lng, results));
  },

  updateLocation(lat, lng, results) {
    this.setProperties({ lat, lng });
    this.sendOnLocationChange(lat, lng, results);
  },

  sendOnLocationChange(lat, lng, results) {
    const { onLocationChange } = this.attrs;

    if (typeOf(onLocationChange) === 'function') {
      onLocationChange(lat, lng, results);
    } else {
      this.sendAction('onLocationChange', lat, lng, results);
    }
  }
});

GMapAddressMarkerComponent.reopenClass({
  positionalParams: ['mapContext']
});

export default GMapAddressMarkerComponent;
