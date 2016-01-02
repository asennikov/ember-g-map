import Ember from 'ember';

export default Ember.Controller.extend({
  randomVariable: 111,

  addressQuery: 'SF, Lafayette Park',

  customOptions: {
    mapTypeId: google.maps.MapTypeId.TERRAIN
  },

  actions: {
    refresh() {
      this.set('randomVariable', Math.floor(Math.random() * 1000));
    },

    onInfowindowClosed() {
      window.alert('Info Window Closed!');
    }
  }
});
