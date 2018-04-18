import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { isPresent, isEmpty } from '@ember/utils';
import { observer } from '@ember/object';
import { run } from '@ember/runloop';
import layout from '../templates/components/g-map-route-address-waypoint';

const GMapRouteAddressWaypointComponent = Component.extend({
  layout,
  classNames: ['g-map-route-address-waypoint'],

  map: alias('routeContext.map'),

  didInsertElement() {
    this._super(...arguments);
    this.initPlacesService();
  },

  initPlacesService: observer('map', function() {
    const map = this.get('map');
    let service = this.get('placesService');

    if (isPresent(map)
      && isEmpty(service)
      && (typeof FastBoot === 'undefined')
      && (typeof google !== 'undefined')) {
      service = new google.maps.places.PlacesService(map);
      this.set('placesService', service);

      this.searchLocation();
    }
  }),

  onAddressChanged: observer('address', function() {
    run.once(this, 'searchLocation');
  }),

  searchLocation() {
    const service = this.get('placesService');
    const address = this.get('address');

    if (isPresent(service) && isPresent(address)) {
      const request = { query: address };

      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          this.updateLocation(results);
        }
      });
    }
  },

  updateLocation(results) {
    if (!this.isDestroyed) {
      const lat = results[0].geometry.location.lat();
      const lng = results[0].geometry.location.lng();

      this.set('lat', lat);
      this.set('lng', lng);
    }
  }
});

GMapRouteAddressWaypointComponent.reopenClass({
  positionalParams: ['routeContext']
});

export default GMapRouteAddressWaypointComponent;
