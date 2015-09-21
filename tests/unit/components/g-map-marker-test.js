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
      parentView: new GMapComponent()
    });
  },

  afterEach() {
    google.maps.Marker.restore();
  }
});

test('it should construct new `Marker` object after render', function(assert) {
  this.render();

  sinon.assert.calledOnce(google.maps.Marker);
  assert.equal(component.get('marker'), fakeMarkerObject);
});

test('new `Marker` shouldn\'t be constructed if it already present in component', function() {
  run(() => component.set('marker', fakeMarkerObject));
  this.render();

  sinon.assert.notCalled(google.maps.Marker);
});

test('it should trigger `setMap` on `didInsertElement` event', function() {
  this.render();

  component.setMap = sinon.spy();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setMap);
});

test('it should trigger `setMap` of marker with null on `willDestroyElement` event if marker is set', function() {
  run(() => component.set('marker', fakeMarkerObject));
  this.render();

  fakeMarkerObject.setMap = sinon.spy();
  component.trigger('willDestroyElement');
  sinon.assert.calledOnce(fakeMarkerObject.setMap);
  sinon.assert.calledWith(fakeMarkerObject.setMap,null);
});

test('it should not trigger `setMap` of marker on `willDestroyElement` event if there is no marker', function() {
  this.render();

  run(() => component.set('marker', undefined));
  fakeMarkerObject.setMap = sinon.spy();
  component.trigger('willDestroyElement');
  sinon.assert.notCalled(fakeMarkerObject.setMap);
});

test('it should trigger `setMap` on `parentView.map` change', function() {
  run(() => component.set('parentView', { map: '' }));
  this.render();

  component.setMap = sinon.spy();
  run(() => component.set('parentView.map', {}));
  sinon.assert.calledOnce(component.setMap);
});

test('it should trigger `setPosition` on `didInsertElement` event', function() {
  this.render();

  component.setPosition = sinon.spy();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setPosition);
});

test('it should trigger `setPosition` on `lat` change', function() {
  this.render();

  component.setPosition = sinon.spy();
  run(() => component.set('lat', 14));
  sinon.assert.calledOnce(component.setPosition);
});

test('it should trigger `setPosition` on `lng` change', function() {
  this.render();

  component.setPosition = sinon.spy();
  run(() => component.set('lng', 21));
  sinon.assert.calledOnce(component.setPosition);
});

test('it should trigger `setPosition` only once on `lat` and `lng` change', function() {
  this.render();

  component.setPosition = sinon.spy();
  run(() => component.setProperties({
    lng: 1,
    lat: 11
  }));
  sinon.assert.calledOnce(component.setPosition);
});

test('it should call `setPosition` of google marker on `setPosition` with lat/lng present', function() {
  this.render();

  run(() => component.setProperties({
    lat: 10,
    lng: 100
  }));

  fakeMarkerObject.setPosition = sinon.stub();
  let point = {};
  sinon.stub(google.maps, 'LatLng').returns(point);
  run(() => component.setPosition());
  sinon.assert.calledOnce(fakeMarkerObject.setPosition);
  sinon.assert.calledWith(fakeMarkerObject.setPosition, point);
  google.maps.LatLng.restore();
});

test('it should not call `setPosition` of google marker on `setPosition` when no lat present', function() {
  this.render();

  run(() => component.set('lat', 10));

  fakeMarkerObject.setPosition = sinon.stub();
  run(() => component.setPosition());
  sinon.assert.notCalled(fakeMarkerObject.setPosition);
});

test('it should not call `setPosition` of google marker on `setPosition` when no lng present', function() {
  this.render();

  run(() => component.set('lng', 10));

  fakeMarkerObject.setPosition = sinon.stub();
  run(() => component.setPosition());
  sinon.assert.notCalled(fakeMarkerObject.setPosition);
});

test('it should call `setMap` of google marker on `setMap` with `map` present', function() {
  this.render();

  let mapObject = {};
  run(() => component.set('map', mapObject));

  fakeMarkerObject.setMap = sinon.stub();
  run(() => component.setMap());
  sinon.assert.calledOnce(fakeMarkerObject.setMap);
  sinon.assert.calledWith(fakeMarkerObject.setMap, mapObject);
});

test('it should not call `setMap` of google marker on `setMap` when no `map` present', function() {
  this.render();

  fakeMarkerObject.setMap = sinon.stub();
  run(() => component.setMap());
  sinon.assert.notCalled(fakeMarkerObject.setMap);
});

test('it should trigger `setIcon` on `didInsertElement` event', function() {
  this.render();

  component.setIcon = sinon.spy();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setIcon);
});

test('it should trigger `setIcon` on `icon` change', function() {
  this.render();

  component.setIcon = sinon.spy();
  run(() => component.set('icon', 'image-src'));
  sinon.assert.calledOnce(component.setIcon);
});

test('it should call `setIcon` of google marker on `setIcon` with icon present', function() {
  run(() => component.set('icon', 'image-src'));
  this.render();

  fakeMarkerObject.setIcon = sinon.stub();
  run(() => component.setIcon());
  sinon.assert.calledOnce(fakeMarkerObject.setIcon);
  sinon.assert.calledWith(fakeMarkerObject.setIcon, 'image-src');
});

test('it should not call `setIcon` of google marker on `setIcon` when no icon present', function() {
  run(() => component.set('icon', undefined));
  this.render();

  fakeMarkerObject.setIcon = sinon.stub();
  run(() => component.setIcon());
  sinon.assert.notCalled(fakeMarkerObject.setIcon);
});

test('it should call `setInfowindow` on `setMap` when `withInfowindow` is true', function() {
  this.render();

  run(() => component.set('map', {}));
  run(() => component.set('withInfowindow', true));

  component.setInfowindow = sinon.stub();
  run(() => component.setMap());
  sinon.assert.calledOnce(component.setInfowindow);
});

test('it should not call `setInfowindow` on `setMap` when `withInfowindow` is not true', function() {
  this.render();

  run(() => component.set('map', {}));
  run(() => component.set('withInfowindow', undefined));

  component.setInfowindow = sinon.stub();
  run(() => component.setMap());
  sinon.assert.notCalled(component.setInfowindow);
});

test('it should construct new `Infowindow` on `setInfowindow` with `map` set', function() {
  this.render();

  run(() => component.set('map', {}));

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

test('new `Infowindow` shouldn\'t be constructed if no map is set', function() {
  this.render();

  run(() => component.set('map', undefined));

  sinon.stub(google.maps, 'InfoWindow');
  run(() => component.setInfowindow());

  sinon.assert.notCalled(google.maps.InfoWindow);

  google.maps.InfoWindow.restore();
});

test('new `Infowindow` shouldn\'t be constructed if no marker is set', function() {
  this.render();

  run(() => component.set('marker', undefined));

  sinon.stub(google.maps, 'InfoWindow');
  run(() => component.setInfowindow());

  sinon.assert.notCalled(google.maps.InfoWindow);

  google.maps.InfoWindow.restore();
});
