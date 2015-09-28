import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import GMapComponent from 'ember-g-map/components/g-map';
import sinon from 'sinon';

const { run } = Ember;

const fakeMarkerObject = {
  setPosition: sinon.stub(),
  setIcon: sinon.stub(),
  setMap: sinon.stub(),
  addListener: sinon.stub()
};

let component;

moduleForComponent('g-map-marker', 'Unit | Component | g map marker', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true,

  beforeEach() {
    sinon.stub(google.maps, 'Marker').returns(fakeMarkerObject);
    component = this.subject({
      mapContext: new GMapComponent()
    });
  },

  afterEach() {
    google.maps.Marker.restore();
  }
});

test('it constructs new `Marker` object after render', function(assert) {
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(google.maps.Marker);
  assert.equal(component.get('marker'), fakeMarkerObject);
});

test('new `Marker` isn\'t constructed if it already present in component', function() {
  run(() => component.set('marker', fakeMarkerObject));
  component.trigger('didInsertElement');
  sinon.assert.notCalled(google.maps.Marker);
});

test('it triggers `setMap` on `didInsertElement` event', function() {
  component.setMap = sinon.spy();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setMap);
});

test('it triggers `setMap` of marker with null on `willDestroyElement` event if marker is set', function() {
  fakeMarkerObject.setMap = sinon.spy();

  run(() => component.set('marker', fakeMarkerObject));
  component.trigger('willDestroyElement');

  sinon.assert.calledOnce(fakeMarkerObject.setMap);
  sinon.assert.calledWith(fakeMarkerObject.setMap, null);
});

test('it doesn\'t trigger `setMap` of marker on `willDestroyElement` event if there is no marker', function() {
  fakeMarkerObject.setMap = sinon.spy();

  run(() => component.set('marker', undefined));
  component.trigger('willDestroyElement');

  sinon.assert.notCalled(fakeMarkerObject.setMap);
});

test('it triggers `setMap` on `mapContext.map` change', function() {
  run(() => component.set('mapContext', { map: '' }));
  component.setMap = sinon.spy();
  run(() => component.set('mapContext.map', {}));
  sinon.assert.calledOnce(component.setMap);
});

test('it triggers `setPosition` on `didInsertElement` event', function() {
  component.setPosition = sinon.spy();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setPosition);
});

test('it triggers `setPosition` on `lat` change', function() {
  component.setPosition = sinon.spy();
  run(() => component.set('lat', 14));
  sinon.assert.calledOnce(component.setPosition);
});

test('it triggers `setPosition` on `lng` change', function() {
  component.setPosition = sinon.spy();
  run(() => component.set('lng', 21));
  sinon.assert.calledOnce(component.setPosition);
});

test('it triggers `setPosition` only once on `lat` and `lng` change', function() {
  component.setPosition = sinon.spy();
  run(() => component.setProperties({ lng: 1, lat: 11 }));
  sinon.assert.calledOnce(component.setPosition);
});

test('it calls `setPosition` of google marker on `setPosition` with lat/lng present', function() {
  let point = {};
  sinon.stub(google.maps, 'LatLng').returns(point);

  run(() => component.setProperties({
    lat: 10,
    lng: 100,
    marker: fakeMarkerObject
  }));

  fakeMarkerObject.setPosition = sinon.stub();

  run(() => component.setPosition());

  sinon.assert.calledOnce(fakeMarkerObject.setPosition);
  sinon.assert.calledWith(fakeMarkerObject.setPosition, point);

  google.maps.LatLng.restore();
});

test('it doesn\'t call `setPosition` of google marker on `setPosition` when no lat present', function() {
  fakeMarkerObject.setPosition = sinon.stub();

  run(() => component.setProperties({
    lng: 100,
    marker: fakeMarkerObject
  }));
  run(() => component.setPosition());
  sinon.assert.notCalled(fakeMarkerObject.setPosition);
});

test('it doesn\'t call `setPosition` of google marker on `setPosition` when no lng present', function() {
  fakeMarkerObject.setPosition = sinon.stub();

  run(() => component.setProperties({
    lat: 10,
    marker: fakeMarkerObject
  }));
  run(() => component.setPosition());

  sinon.assert.notCalled(fakeMarkerObject.setPosition);
});

test('it calls `setMap` of google marker on `setMap` with `map` present', function() {
  let mapObject = {};
  run(() => component.setProperties({
    map: mapObject,
    marker: fakeMarkerObject
  }));

  fakeMarkerObject.setMap = sinon.stub();

  run(() => component.setMap());

  sinon.assert.calledOnce(fakeMarkerObject.setMap);
  sinon.assert.calledWith(fakeMarkerObject.setMap, mapObject);
});

test('it doesn\'t call `setMap` of google marker on `setMap` when no `map` present', function() {
  fakeMarkerObject.setMap = sinon.stub();
  run(() => component.setMap());
  sinon.assert.notCalled(fakeMarkerObject.setMap);
});

test('it triggers `setIcon` on `didInsertElement` event', function() {
  component.setIcon = sinon.spy();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setIcon);
});

test('it triggers `setIcon` on `icon` change', function() {
  component.setIcon = sinon.spy();
  run(() => component.set('icon', 'image-src'));
  sinon.assert.calledOnce(component.setIcon);
});

test('it calls `setIcon` of google marker on `setIcon` with icon present', function() {
  run(() => component.setProperties({
    icon: 'image-src',
    marker: fakeMarkerObject
  }));

  fakeMarkerObject.setIcon = sinon.stub();

  run(() => component.setIcon());

  sinon.assert.calledOnce(fakeMarkerObject.setIcon);
  sinon.assert.calledWith(fakeMarkerObject.setIcon, 'image-src');
});

test('it doesn\'t call `setIcon` of google marker on `setIcon` when no icon present', function() {
  fakeMarkerObject.setIcon = sinon.stub();

  run(() => component.setProperties({
    icon: undefined,
    marker: fakeMarkerObject
  }));
  run(() => component.setIcon());

  sinon.assert.notCalled(fakeMarkerObject.setIcon);
});

test('it calls `setInfowindow` on `setMap` when `withInfowindow` is true', function() {
  component.setInfowindow = sinon.stub();

  run(() => component.set('map', {}));
  run(() => component.setProperties({
    withInfowindow: true,
    marker: fakeMarkerObject
  }));
  run(() => component.setMap());

  sinon.assert.calledOnce(component.setInfowindow);
});

test('it doesn\'t call `setInfowindow` on `setMap` when `withInfowindow` is not true', function() {
  component.setInfowindow = sinon.stub();

  run(() => component.set('map', {}));
  run(() => component.set('withInfowindow', undefined));
  run(() => component.setMap());

  sinon.assert.notCalled(component.setInfowindow);
});

test('it constructs new `Infowindow` on `setInfowindow` with `map` set', function() {
  run(() => component.setProperties({
    map: {},
    marker: fakeMarkerObject
  }));

  let infowindow = {
    open: sinon.stub()
  };
  sinon.stub(google.maps, 'InfoWindow').returns(infowindow);

  let correctOptions = { content: component.get('element') };

  run(() => component.setInfowindow());

  sinon.assert.calledOnce(google.maps.InfoWindow);
  sinon.assert.calledWith(google.maps.InfoWindow, correctOptions);

  google.maps.InfoWindow.restore();
});

test('new `Infowindow` isn\'t constructed if no map is set', function() {
  sinon.stub(google.maps, 'InfoWindow');

  run(() => component.set('map', undefined));
  run(() => component.setInfowindow());

  sinon.assert.notCalled(google.maps.InfoWindow);

  google.maps.InfoWindow.restore();
});

test('new `Infowindow` isn\'t constructed if no marker is set', function() {
  sinon.stub(google.maps, 'InfoWindow');

  run(() => component.set('marker', undefined));
  run(() => component.setInfowindow());

  sinon.assert.notCalled(google.maps.InfoWindow);

  google.maps.InfoWindow.restore();
});

test('it registers itself in parent\'s `markers` array on `init` event', function(assert) {
  assert.equal(component.get('mapContext.markers').length, 1);
  assert.equal(component.get('mapContext.markers')[0], component);
});

test('it unregisters itself in parent\'s `markers` array on `willDestroyElement` event', function(assert) {
  assert.equal(component.get('mapContext.markers').length, 1);
  component.trigger('willDestroyElement');
  assert.equal(component.get('mapContext.markers').length, 0);
});
