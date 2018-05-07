import { reads } from '@ember/object/computed';
import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  randomVariable: 111,

  addressQuery: 'SF, Lafayette Park',
  addressQueryInput: reads('addressQuery'),
  routeColor: 'red',
  showingAllPolylineCoords: true,

  customOptions: computed(function() {
    if (google) {
      return { mapTypeId: google.maps.MapTypeId.TERRAIN };
    }
  }),

  actions: {
    refresh() {
      this.set('randomVariable', Math.floor(Math.random() * 1000));
    },

    onInfowindowClosed() {
      window.alert('Info Window Closed!');
    },

    updateAdressQuery() {
      this.set('addressQuery', this.get('addressQueryInput'));
    },

    toggleRouteColor() {
      if (this.get('routeColor') === 'red') {
        this.set('routeColor', 'green');
      } else {
        this.set('routeColor', 'red');
      }
    },

    togglePolylineCoords() {
      this.toggleProperty('showingAllPolylineCoords');
    }
  }
});
