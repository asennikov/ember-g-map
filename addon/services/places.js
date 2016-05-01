import Ember from 'ember';

const { isPresent, isEmpty, RSVP } = Ember;

export default Ember.Service.extend({
  init() {
    this._super(...arguments);
    this.internalService = null;
  },

  start(map) {
    if (isEmpty(this.get('internalService'))) {
      this.set('internalService', new google.maps.places.PlacesService(map));
    }
  },

  search(address) {
    const service = this.get('internalService');

    if (isPresent(service) && isPresent(address)) {
      const request = { query: address };

      return RSVP.Promise((resolve, reject) => {
        service.textSearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            const firstLocation = results[0].geometry.location;
            resolve(firstLocation.lat(), firstLocation.lng(), results);
          } else {
            reject();
          }
        });
      });
    }
  }
});
