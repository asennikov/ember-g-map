import Ember from 'ember';
import { moduleForComponent } from 'ember-qunit';
import test from '../../ember-sinon-qunit/test';
import sinon from 'sinon';

const { run } = Ember;

const fakeMapObject = {
  setCenter: sinon.stub(),
  setZoom: sinon.stub(),
  fitBounds: sinon.stub()
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

test('it constructs new `Map` object after render', function(assert) {
  let component = this.subject();

  this.render();
  sinon.assert.calledOnce(google.maps.Map);
  assert.equal(component.get('map'), fakeMapObject);
});

test('it constructs new `Map` object with given custom options', function() {
  this.subject({
    options: {
      googleMapOption: 123
    }
  });
  this.render();

  let canvasElement = this.$().find('.g-map-canvas').get(0);
  sinon.assert.calledWith(google.maps.Map, canvasElement, { googleMapOption: 123 });
});

test('new `Map` isn\'t constructed if it already present in component', function() {
  this.subject({
    map: fakeMapObject
  });
  this.render();

  sinon.assert.notCalled(google.maps.Map);
});

test('it triggers `setZoom` on `didInsertElement` event', function() {
  let component = this.subject();
  this.render();

  component.setZoom = sinon.spy();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setZoom);
});

test('it triggers `setCenter` on `didInsertElement` event', function() {
  let component = this.subject();
  this.render();

  component.setCenter = sinon.spy();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setCenter);
});

test('it triggers `setZoom` on `zoom` change', function() {
  let component = this.subject();
  this.render();

  component.setZoom = sinon.spy();
  run(() => component.set('zoom', 14));
  sinon.assert.calledOnce(component.setZoom);
});

test('it triggers `setCenter` on `lat` change', function() {
  let component = this.subject();
  this.render();

  component.setCenter = sinon.spy();
  run(() => component.set('lat', 14));
  sinon.assert.calledOnce(component.setCenter);
});

test('it triggers `setCenter` on `lng` change', function() {
  let component = this.subject();
  this.render();

  component.setCenter = sinon.spy();
  run(() => component.set('lng', 21));
  sinon.assert.calledOnce(component.setCenter);
});

test('it triggers `setCenter` only once on `lat` and `lng` change', function() {
  let component = this.subject();
  this.render();

  component.setCenter = sinon.spy();
  run(() => component.setProperties({
    lng: 1,
    lat: 11
  }));
  sinon.assert.calledOnce(component.setCenter);
});

test('it calls `setCenter` of google map on `setCenter` with lat/lng present', function() {
  let component = this.subject({
    lat: 10,
    lng: 100
  });
  this.render();

  fakeMapObject.setCenter = sinon.stub();
  let point = {};
  sinon.stub(google.maps, 'LatLng').returns(point);
  run(() => component.setCenter());

  sinon.assert.calledOnce(fakeMapObject.setCenter);
  sinon.assert.calledWith(fakeMapObject.setCenter, point);

  google.maps.LatLng.restore();
});

test('it calls `setZoom` of google map on `setZoom` with zoom present', function() {
  let component = this.subject({
    zoom: 14
  });
  this.render();

  fakeMapObject.setZoom = sinon.stub();
  run(() => component.setZoom());
  sinon.assert.calledOnce(fakeMapObject.setZoom);
  sinon.assert.calledWith(fakeMapObject.setZoom, 14);
});

test('it doesn\'t call `setCenter` of google map on `setCenter` when no lat present', function() {
  let component = this.subject({
    lat: 10
  });
  this.render();

  fakeMapObject.setCenter = sinon.stub();
  run(() => component.setCenter());
  sinon.assert.notCalled(fakeMapObject.setCenter);
});

test('it doesn\'t call `setCenter` of google map on `setCenter` when no lng present', function() {
  let component = this.subject({
    lng: 10
  });
  this.render();

  fakeMapObject.setCenter = sinon.stub();
  run(() => component.setCenter());
  sinon.assert.notCalled(fakeMapObject.setCenter);
});

test('it doesn\'t call `setZoom` of google map on `setZoom` when no zoom present', function() {
  let component = this.subject();
  this.render();

  fakeMapObject.setZoom = sinon.stub();
  run(() => component.setZoom());
  sinon.assert.calledOnce(fakeMapObject.setZoom);
});

test('it calls `fitToMarkers` object on `didInsertElement`', function() {
  let component = this.subject({
    shouldFit: true
  });
  this.render();

  component.fitToMarkers = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.fitToMarkers);
});

test('it doesn\'t call `fitToMarkers` object on `didInsertElement` if shouldFit is falsy', function() {
  let component = this.subject({
    shouldFit: null
  });
  this.render();

  component.fitToMarkers = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.notCalled(component.fitToMarkers);
});

test('it calls `fitBounds` of google map on `fitToMarkers`', function() {
  let firstMarker = Ember.Object.create({ lat: 1, lng: 2 });
  let secondMarker = Ember.Object.create({ lat: 3, lng: 4 });
  let component = this.subject();
  this.render();

  fakeMapObject.fitBounds = sinon.stub();

  let fakeLatLngBounds = {
    extend: sinon.stub()
  };
  sinon.stub(google.maps, 'LatLngBounds').returns(fakeLatLngBounds);

  let stubbedLatLng = sinon.stub(google.maps, 'LatLng');
  stubbedLatLng.onCall(0).returns(firstMarker);
  stubbedLatLng.onCall(1).returns(secondMarker);

  run(() => component.set('markers', [ firstMarker, secondMarker ]));
  run(() => component.fitToMarkers());
  sinon.assert.calledOnce(google.maps.LatLngBounds);

  sinon.assert.calledTwice(google.maps.LatLng);
  sinon.assert.calledWith(google.maps.LatLng, 1, 2);
  sinon.assert.calledWith(google.maps.LatLng, 3, 4);

  sinon.assert.calledTwice(fakeLatLngBounds.extend);
  sinon.assert.calledWith(fakeLatLngBounds.extend, firstMarker);
  sinon.assert.calledWith(fakeLatLngBounds.extend, secondMarker);

  sinon.assert.calledOnce(fakeMapObject.fitBounds);
  sinon.assert.calledWith(fakeMapObject.fitBounds, fakeLatLngBounds);

  google.maps.LatLng.restore();
  google.maps.LatLngBounds.restore();
});

test('it registers marker in `markers` array during `registerMarker`', function(assert) {
  let component = this.subject();
  this.render();

  run(() => component.get('markers').addObject('first'));
  run(() => component.registerMarker('second'));
  run(() => component.registerMarker('third'));

  assert.equal(component.get('markers').length, 3);
  assert.equal(component.get('markers')[1], 'second');
  assert.equal(component.get('markers')[2], 'third');
});

test('it unregisters marker from `markers` array during `unregisterMarker`', function(assert) {
  let component = this.subject();
  this.render();

  run(() => component.get('markers').addObjects(['first', 'second', 'third']));
  run(() => component.unregisterMarker('second'));

  assert.equal(component.get('markers').length, 2);
  assert.equal(component.get('markers')[0], 'first');
  assert.equal(component.get('markers')[1], 'third');
});
