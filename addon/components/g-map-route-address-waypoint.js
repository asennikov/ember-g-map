import Ember from 'ember';
import layout from '../templates/components/g-map-route-address-waypoint';

const { observer, run, inject } = Ember;

const GMapRouteAddressWaypointComponent = Ember.Component.extend({
  layout: layout,
  classNames: ['g-map-route-address-waypoint'],

  places: inject.service(),

  didInsertElement() {
    this._super();
    this.searchLocation();
  },

  onAddressChanged: observer('address', function() {
    run.once(this, 'searchLocation');
  }),

  searchLocation() {
    const address = this.get('address');
    this.get('places').search(address)
      .then((lat, lng) => this.updateLocation(lat, lng));
  },

  updateLocation(lat, lng) {
    this.setProperties({ lat, lng });
  }
});

GMapRouteAddressWaypointComponent.reopenClass({
  positionalParams: ['routeContext']
});

export default GMapRouteAddressWaypointComponent;
