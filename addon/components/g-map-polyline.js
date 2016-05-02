import Ember from 'ember';
import layout from '../templates/components/g-map-polyline';
import GMapComponent from './g-map';
import compact from '../utils/compact';


const { isEmpty, isPresent, observer, computed, run, assert, typeOf } = Ember;

const allowedPolylineOptions = Ember.A(['strokeColor', 'strokeWeight', 'strokeOpacity', 'zIndex']);

const GMapPolylineComponent = Ember.Component.extend({
  layout: layout,
  classNames: ['g-map-polyline'],

  map: computed.alias('mapContext.map'),

  init() {
    this._super(arguments);
    this.infowindow = null;
    this.set('coordinates', Ember.A());
    if (isEmpty(this.get('group'))) {
      this.set('group', null);
    }

    const mapContext = this.get('mapContext');
    assert('Must be inside {{#g-map}} component with context set', mapContext instanceof GMapComponent);

    mapContext.registerPolyline(this);
  },

  didInsertElement() {
    this._super();
    if (isEmpty(this.get('polyline'))) {
      const options = compact(this.getProperties(allowedPolylineOptions));
      const polyline = new google.maps.Polyline(options);
      this.set('polyline', polyline);
    }
    this.setPath();
    this.setMap();
    this.setOnClick();
  },

  willDestroyElement() {
    this.unsetPolylineFromMap();
    this.get('mapContext').unregisterPolyline(this);
  },

  registerInfowindow(infowindow, openEvent, closeEvent) {
    this.set('infowindow', infowindow);
    this.attachOpenCloseEvents(infowindow, openEvent, closeEvent);
  },

  unregisterInfowindow() {
    this.set('infowindow', null);
  },

  registerCoordinate(coordinate) {
    this.get('coordinates').addObject(coordinate);
  },

  unregisterCoordinate(coordinate) {
    this.get('coordinates').removeObject(coordinate);
  },

  attachOpenCloseEvents(infowindow, openEvent, closeEvent) {
    const polyline = this.get('polyline');
    if (openEvent === closeEvent) {
      this.attachTogglingInfowindowEvent(polyline, infowindow, openEvent);
    } else {
      this.attachOpenInfowindowEvent(polyline, infowindow, openEvent);
      this.attachCloseInfowindowEvent(polyline, infowindow, closeEvent);
    }
  },

  attachOpenInfowindowEvent(polyline, infowindow, event) {
    if (isPresent(event)) {
      polyline.addListener(event, () => infowindow.open());
    }
  },

  attachCloseInfowindowEvent(polyline, infowindow, event) {
    if (isPresent(event)) {
      polyline.addListener(event, () => infowindow.close());
    }
  },

  attachTogglingInfowindowEvent(polyline, infowindow, event) {
    if (isPresent(event)) {
      polyline.addListener(event, () => {
        if (infowindow.get('isOpen')) {
          infowindow.close();
        } else {
          infowindow.open();
        }
      });
    }
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
    const options = compact(this.getProperties(allowedPolylineOptions));
    var coordArray = [];
    coordinates.forEach(function(coordinate){
      const coord = coordinate.get('coordinate');
      if (isPresent(coord)) {
        coordArray.push(coord);
      }
    });
    Ember.Logger.log(coordArray);
    // assert('Must have at least two valid coordinates in {{#g-map-polyline}} component', coordArray.length > 1);
    if (coordArray.length > 1 && isPresent(polyline) && isPresent(coordinates)) {
      polyline.setPath(coordArray);
    }
    if (isPresent(polyline) && isPresent(options)) {
      polyline.setOptions(options);
    }
  },

  iconChanged: observer('icon', function() {
    run.once(this, 'setIcon');
  }),

  setOnClick() {
    const polyline = this.get('polyline');
    if (isPresent(polyline)) {
      polyline.addListener('click', () => this.sendOnClick());
    }
  },

  labelChanged: observer('label', function() {
    run.once(this, 'setLabel');
  }),

  setLabel() {
    const polyline = this.get('polyline');
    const label = this.get('label');

    if (isPresent(polyline) && isPresent(label)) {
      polyline.setLabel(label);
    }
  },

  titleChanged: observer('title', function() {
    run.once(this, 'setTitle');
  }),

  setTitle() {
    const polyline = this.get('polyline');
    const title = this.get('title');

    if (isPresent(polyline) && isPresent(title)) {
      polyline.setTitle(title);
    }
  },

  sendOnClick() {
    const { onClick } = this.attrs;
    const mapContext = this.get('mapContext');
    const group = this.get('group');

    if (typeOf(onClick) === 'function') {
      onClick();
    } else {
      this.sendAction('onClick');
    }

    if (isPresent(group)) {
      mapContext.groupPolylineClicked(this, group);
    }
  },

  closeInfowindow() {
    const infowindow = this.get('infowindow');
    if (isPresent(infowindow)) {
      infowindow.close();
    }
  }
});

GMapPolylineComponent.reopenClass({
  positionalParams: ['mapContext']
});

export default GMapPolylineComponent;
