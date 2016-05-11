import Ember from 'ember';

const { computed } = Ember;

export default Ember.Controller.extend({
  randomVariable: 111,

  addressQuery: 'SF, Lafayette Park',
  addressQueryInput: computed.reads('addressQuery'),
  routeColor: 'red',

  customOptions: {
    mapTypeId: computed(function() {
      return google ? google.maps.MapTypeId.TERRAIN : null;
    })
  },

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
    }
  }
});
