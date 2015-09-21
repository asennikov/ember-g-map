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

  assert.ok(google.maps.Marker.calledOnce);
  assert.equal(component.get('marker'), fakeMarkerObject);
});

test('new `Marker` shouldn\'t be constructed if it already present in component', function(assert) {
  run(() => component.set('marker', fakeMarkerObject));
  this.render();

  assert.equal(google.maps.Marker.callCount, 0);
});

test('it should trigger `setMap` on `didInsertElement` event', function(assert) {
  this.render();

  component.setMap = sinon.spy();
  component.trigger('didInsertElement');
  assert.ok(component.setMap.calledOnce);
});

test('it should trigger `setMap` of marker with null on `willDestroyElement` event if marker is set', function(assert) {
  run(() => component.set('marker', fakeMarkerObject));
  this.render();

  fakeMarkerObject.setMap = sinon.spy();
  component.trigger('willDestroyElement');
  assert.ok(fakeMarkerObject.setMap.calledOnce);
  assert.ok(fakeMarkerObject.setMap.calledWith(null));
});

test('it should not trigger `setMap` of marker on `willDestroyElement` event if there is no marker', function(assert) {
  this.render();

  run(() => component.set('marker', undefined));
  fakeMarkerObject.setMap = sinon.spy();
  component.trigger('willDestroyElement');
  assert.equal(fakeMarkerObject.setMap.callCount, 0);
});

test('it should trigger `setMap` on `parentView.map` change', function(assert) {
  run(() => component.set('parentView', { map: '' }));
  this.render();

  component.setMap = sinon.spy();
  run(() => component.set('parentView.map', {}));
  assert.ok(component.setMap.calledOnce);
});

test('it should trigger `setPosition` on `didInsertElement` event', function(assert) {
  this.render();

  component.setPosition = sinon.spy();
  component.trigger('didInsertElement');
  assert.ok(component.setPosition.calledOnce);
});

test('it should trigger `setPosition` on `lat` change', function(assert) {
  this.render();

  component.setPosition = sinon.spy();
  run(() => component.set('lat', 14));
  assert.ok(component.setPosition.calledOnce);
});

test('it should trigger `setPosition` on `lng` change', function(assert) {
  this.render();

  component.setPosition = sinon.spy();
  run(() => component.set('lng', 21));
  assert.ok(component.setPosition.calledOnce);
});

test('it should trigger `setPosition` only once on `lat` and `lng` change', function(assert) {
  this.render();

  component.setPosition = sinon.spy();
  run(() => component.setProperties({
    lng: 1,
    lat: 11
  }));
  assert.ok(component.setPosition.calledOnce);
});

test('it should call `setPosition` of google marker on `setPosition` with lat/lng present', function(assert) {
  this.render();

  run(() => component.setProperties({
    lat: 10,
    lng: 100
  }));

  fakeMarkerObject.setPosition = sinon.stub();
  let point = {};
  sinon.stub(google.maps, 'LatLng').returns(point);
  run(() => component.setPosition());
  assert.ok(fakeMarkerObject.setPosition.calledOnce);
  assert.ok(fakeMarkerObject.setPosition.calledWith(point));
  google.maps.LatLng.restore();
});

test('it should not call `setPosition` of google marker on `setPosition` when no lat present', function(assert) {
  this.render();

  run(() => component.set('lat', 10));

  fakeMarkerObject.setPosition = sinon.stub();
  run(() => component.setPosition());
  assert.equal(fakeMarkerObject.setPosition.callCount, 0);
});

test('it should not call `setPosition` of google marker on `setPosition` when no lng present', function(assert) {
  this.render();

  run(() => component.set('lng', 10));

  fakeMarkerObject.setPosition = sinon.stub();
  run(() => component.setPosition());
  assert.equal(fakeMarkerObject.setPosition.callCount, 0);
});

test('it should call `setMap` of google marker on `setMap` with `map` present', function(assert) {
  this.render();

  let mapObject = {};
  run(() => component.set('map', mapObject));

  fakeMarkerObject.setMap = sinon.stub();
  run(() => component.setMap());
  assert.ok(fakeMarkerObject.setMap.calledOnce);
  assert.ok(fakeMarkerObject.setMap.calledWith(mapObject));
});

test('it should not call `setMap` of google marker on `setMap` when no `map` present', function(assert) {
  this.render();

  fakeMarkerObject.setMap = sinon.stub();
  run(() => component.setMap());
  assert.equal(fakeMarkerObject.setMap.callCount, 0);
});

test('it should trigger `setIcon` on `didInsertElement` event', function(assert) {
  this.render();

  component.setIcon = sinon.spy();
  component.trigger('didInsertElement');
  assert.ok(component.setIcon.calledOnce);
});

test('it should trigger `setIcon` on `icon` change', function(assert) {
  this.render();

  component.setIcon = sinon.spy();
  run(() => component.set('icon', 'image-src'));
  assert.ok(component.setIcon.calledOnce);
});

test('it should call `setIcon` of google marker on `setIcon` with icon present', function(assert) {
  run(() => component.set('icon', 'image-src'));
  this.render();

  fakeMarkerObject.setIcon = sinon.stub();
  run(() => component.setIcon());
  assert.ok(fakeMarkerObject.setIcon.calledOnce);
  assert.ok(fakeMarkerObject.setIcon.calledWith('image-src'));
});

test('it should not call `setIcon` of google marker on `setIcon` when no icon present', function(assert) {
  run(() => component.set('icon', undefined));
  this.render();

  fakeMarkerObject.setIcon = sinon.stub();
  run(() => component.setIcon());
  assert.equal(fakeMarkerObject.setIcon.callCount, 0);
});

test('it should call `setInfowindow` on `setMap` when `withInfowindow` is true', function(assert) {
  this.render();

  run(() => component.set('map', {}));
  run(() => component.set('withInfowindow', true));

  component.setInfowindow = sinon.stub();
  run(() => component.setMap());
  assert.ok(component.setInfowindow.calledOnce);
});

test('it should not call `setInfowindow` on `setMap` when `withInfowindow` is not true', function(assert) {
  this.render();

  run(() => component.set('map', {}));
  run(() => component.set('withInfowindow', undefined));

  component.setInfowindow = sinon.stub();
  run(() => component.setMap());
  assert.equal(component.setInfowindow.callCount, 0);
});

test('it should construct new `Infowindow` on `setInfowindow` with `map` set', function(assert) {
  this.render();

  run(() => component.set('map', {}));

  let infowindow = {
    open: sinon.stub()
  };
  sinon.stub(google.maps, 'InfoWindow').returns(infowindow);

  run(() => component.setInfowindow());
  assert.ok(google.maps.InfoWindow.calledOnce);
  assert.ok(google.maps.InfoWindow.calledWith({ content: component.get('element') }));
  google.maps.InfoWindow.restore();
});

test('new `Infowindow` shouldn\'t be constructed if no map is set', function(assert) {
  this.render();

  run(() => component.set('map', undefined));

  sinon.stub(google.maps, 'InfoWindow');
  run(() => component.setInfowindow());
  assert.equal(google.maps.InfoWindow.callCount, 0);
  google.maps.InfoWindow.restore();
});

test('new `Infowindow` shouldn\'t be constructed if no marker is set', function(assert) {
  this.render();

  run(() => component.set('marker', undefined));

  sinon.stub(google.maps, 'InfoWindow');
  run(() => component.setInfowindow());
  assert.equal(google.maps.InfoWindow.callCount, 0);
  google.maps.InfoWindow.restore();
});
