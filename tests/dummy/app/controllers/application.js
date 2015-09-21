import Ember from 'ember';

export default Ember.Controller.extend({
  firstMarker: {
    lat: 37.7933,
    lng: -122.4167
  },

  secondMarker: {
    lat: 37.7733,
    lng: -122.4167
  },

  randomVariable: 111,

  actions: {
    refresh() {
      this.set('randomVariable', Math.floor(Math.random() * 1000));
    }
  }
});
