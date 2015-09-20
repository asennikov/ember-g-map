import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import sinon from 'sinon';

const { run } = Ember;

const fakeMapObject = {
  setCenter: sinon.stub(),
  setZoom: sinon.stub()
};

moduleForComponent('g-map', 'Unit | Component | g map', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true,
  beforeEach() {
    sinon.stub(google.maps, 'Map').returns(fakeMapObject);
  },
  afterEach() {
    google.maps.Map.restore();
  }
});

test('it should construct new `Map` object after render', function(assert) {
  let component = this.subject();

  this.render();
  assert.ok(google.maps.Map.calledOnce);
  assert.equal(component.get('map'), fakeMapObject);
});

test('new `Map` shouldn\'t constructed if it already present in component', function(assert) {
  this.subject({
    map: fakeMapObject
  });
  this.render();

  assert.equal(google.maps.Map.callCount, 0);
});

test('it should trigger `setZoom` on `didInsertElement` event', function(assert) {
  let component = this.subject();
  this.render();

  component.setZoom = sinon.spy();
  component.trigger('didInsertElement');
  assert.ok(component.setZoom.calledOnce);
});

test('it should trigger `setCenter` on `didInsertElement` event', function(assert) {
  let component = this.subject();
  this.render();

  component.setCenter = sinon.spy();
  component.trigger('didInsertElement');
  assert.ok(component.setCenter.calledOnce);
});

test('it should trigger `setZoom` on `zoom` change', function(assert) {
  let component = this.subject();
  this.render();

  component.setZoom = sinon.spy();
  run(() => component.set('zoom', 14));
  assert.ok(component.setZoom.calledOnce);
});

test('it should trigger `setCenter` on `lat` change', function(assert) {
  let component = this.subject();
  this.render();

  component.setCenter = sinon.spy();
  run(() => component.set('lat', 14));
  assert.ok(component.setCenter.calledOnce);
});

test('it should trigger `setCenter` on `lng` change', function(assert) {
  let component = this.subject();
  this.render();

  component.setCenter = sinon.spy();
  run(() => component.set('lng', 21));
  assert.ok(component.setCenter.calledOnce);
});

test('it should trigger `setCenter` only once on `lat` and `lng` change', function(assert) {
  let component = this.subject();
  this.render();

  component.setCenter = sinon.spy();
  run(() => component.setProperties({
    lng: 1,
    lat: 11
  }));
  assert.ok(component.setCenter.calledOnce);
});

test('it should call `setCenter` of google map on `setCenter` with lat/lng present', function(assert) {
  let component = this.subject({
    lat: 10,
    lng: 100
  });
  this.render();

  fakeMapObject.setCenter = sinon.stub();
  let point = {};
  sinon.stub(google.maps, 'LatLng').returns(point);
  run(() => component.setCenter());
  assert.ok(fakeMapObject.setCenter.calledOnce);
  assert.ok(fakeMapObject.setCenter.calledWith(point));
  google.maps.LatLng.restore();
});

test('it should call `setZoom` of google map on `setZoom` with zoom present', function(assert) {
  let component = this.subject({
    zoom: 14
  });
  this.render();

  fakeMapObject.setZoom = sinon.stub();
  run(() => component.setZoom());
  assert.ok(fakeMapObject.setZoom.calledOnce);
  assert.ok(fakeMapObject.setZoom.calledWith(14));
});

test('it should not call `setCenter` of google map on `setCenter` when no lat present', function(assert) {
  let component = this.subject({
    lat: 10
  });
  this.render();

  fakeMapObject.setCenter = sinon.stub();
  run(() => component.setCenter());
  assert.equal(fakeMapObject.setCenter.callCount, 0);
});

test('it should not call `setCenter` of google map on `setCenter` when no lng present', function(assert) {
  let component = this.subject({
    lng: 10
  });
  this.render();

  fakeMapObject.setCenter = sinon.stub();
  run(() => component.setCenter());
  assert.equal(fakeMapObject.setCenter.callCount, 0);
});

test('it should not call `setZoom` of google map on `setZoom` when no zoom present', function(assert) {
  let component = this.subject();
  this.render();

  fakeMapObject.setZoom = sinon.stub();
  run(() => component.setZoom());
  assert.ok(fakeMapObject.setZoom.calledOnce);
});
