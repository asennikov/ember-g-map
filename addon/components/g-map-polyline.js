import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { A } from '@ember/array';
import { observer } from '@ember/object';
import { run } from '@ember/runloop';
import { assert } from '@ember/debug';
import { typeOf, isPresent, isEmpty } from '@ember/utils';
import layout from '../templates/components/g-map-polyline';
import GMapComponent from './g-map';
import compact from '../utils/compact';

const allowedPolylineOptions = A(['strokeColor', 'strokeWeight', 'strokeOpacity', 'zIndex', 'geodesic', 'icons', 'clickable', 'draggable', 'visible', 'path']);

const GMapPolylineComponent = Component.extend({
  layout,
  classNames: ['g-map-polyline'],

  map: alias('mapContext.map'),

  init() {
    this._super(...arguments);
    this.infowindow = null;
    this.set('coordinates', A());
    if (isEmpty(this.get('group'))) {
      this.set('group', null);
    }

    const mapContext = this.get('mapContext');
    assert('Must be inside {{#g-map}} component with context set', mapContext instanceof GMapComponent);

    mapContext.registerPolyline(this);
  },

  didInsertElement() {
    this._super(...arguments);
    if (isEmpty(this.get('polyline'))
      && (typeof google !== 'undefined')) {
      const options = compact(this.getProperties(allowedPolylineOptions));
      const polyline = new google.maps.Polyline(options);
      this.set('polyline', polyline);
    }
    this.setMap();
    this.setPath();
    this.updatePolylineOptions();
    this.setOnClick();
    this.setOnDrag();
  },

  willDestroyElement() {
    this.unsetPolylineFromMap();
    this.get('mapContext').unregisterPolyline(this);
  },

  registerCoordinate(coordinate) {
    this.get('coordinates').addObject(coordinate);
  },

  unregisterCoordinate(coordinate) {
    this.get('coordinates').removeObject(coordinate);
    this.setPath();
  },

  unsetPolylineFromMap() {
    const polyline = this.get('polyline');
    if (isPresent(polyline)) {
      polyline.setMap(null);
    }
  },

  mapWasSet: observer('map', function() {
    run.once(this, 'setMap');
  }),

  setMap() {
    const map = this.get('map');
    const polyline = this.get('polyline');

    if (isPresent(polyline) && isPresent(map)) {
      polyline.setMap(map);
    }
  },

  setPath() {
    const polyline = this.get('polyline');
    const coordinates = this.get('coordinates');
    const path = this.get('path');

    if (isPresent(polyline)) {

      if (isPresent(coordinates) && isEmpty(path)) {
        let coordArray = A(this.get('coordinates').mapBy('coordinate')).compact();
        polyline.setPath(coordArray);
      }

      if (isPresent(path) && isEmpty(coordinates)) {
        polyline.setPath(path);
      }

    }
  },

  polylineOptionsChanged: observer(...allowedPolylineOptions, function() {
    run.once(this, 'updatePolylineOptions');
  }),

  updatePolylineOptions() {
    const polyline = this.get('polyline');
    const options = compact(this.getProperties(allowedPolylineOptions));

    if (isPresent(polyline) && isPresent(Object.keys(options))) {
      polyline.setOptions(options);
    }
  },

  setOnClick() {
    const polyline = this.get('polyline');
    if (isPresent(polyline)) {
      polyline.addListener('click', (e) => this.sendOnClick(e));
    }
  },

  sendOnClick(e) {
    const { onClick } = this.attrs;
    const polyline = this.get('polyline');

    if (typeOf(onClick) === 'function') {
      onClick(e, polyline);
    } else {
      this.sendAction('onClick', e, polyline);
    }
  },

  setOnDrag() {
    const polyline = this.get('polyline');
    if (isPresent(polyline)) {
      polyline.addListener('dragend', (e) => this.sendOnDrag(e));
    }
  },

  sendOnDrag(e) {
    const { onDrag } = this.attrs;
    const polyline = this.get('polyline');

    if (typeOf(onDrag) === 'function') {
      onDrag(e, polyline);
    } else {
      this.sendAction('onDrag', e, polyline);
    }
  }
});

GMapPolylineComponent.reopenClass({
  positionalParams: ['mapContext']
});

export default GMapPolylineComponent;
