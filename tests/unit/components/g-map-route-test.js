import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import GMapComponent from 'ember-g-map/components/g-map';
import sinon from 'sinon';

const { run } = Ember;

const fakeDirectionsService = {
  route: sinon.stub()
};

const fakeDirectionsRenderer = {
  setDirections: sinon.stub(),
  setMap: sinon.stub()
};

let component;

moduleForComponent('g-map-route', 'Unit | Component | g map route', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true,

  beforeEach() {
    sinon.stub(google.maps, 'DirectionsRenderer').returns(fakeDirectionsRenderer);
    sinon.stub(google.maps, 'DirectionsService').returns(fakeDirectionsService);
    component = this.subject({
      parentView: new GMapComponent()
    });
  },

  afterEach() {
    google.maps.DirectionsRenderer.restore();
    google.maps.DirectionsService.restore();
  }
});

test('it should call `initDirectionsService` after render', function(assert) {
  component.initDirectionsService = sinon.stub();
  this.render();

  assert.ok(component.initDirectionsService.calledOnce);
});

test('it should construct new `DirectionsRenderer` on `initDirectionsService` call', function(assert) {
  this.render();

  let mapObject = {};
  run(() => component.set('map', mapObject));
  run(() => component.initDirectionsService());

  let correctRendererOptions = {
    map: mapObject,
    suppressMarkers: true,
    preserveViewport: true
  };

  assert.ok(google.maps.DirectionsRenderer.calledOnce);
  assert.ok(google.maps.DirectionsRenderer.calledWith(correctRendererOptions));
  assert.equal(component.get('directionsRenderer'), fakeDirectionsRenderer);
});

test('it should construct new `DirectionsService` on `initDirectionsService` call', function(assert) {
  this.render();

  run(() => component.set('map', {}));
  run(() => component.initDirectionsService());

  assert.ok(google.maps.DirectionsService.calledOnce);
  assert.equal(component.get('directionsService'), fakeDirectionsService);
});

test('new `DirectionsService` and `DirectionsRenderer` shouldn\'t be constructed if they already present in component', function(assert) {
  this.render();

  run(() => component.set('directionsService', fakeDirectionsService));
  run(() => component.set('directionsRenderer', fakeDirectionsRenderer));
  run(() => component.set('map', {}));
  run(() => component.initDirectionsService());

  assert.equal(google.maps.DirectionsService.callCount, 0);
  assert.equal(google.maps.DirectionsRenderer.callCount, 0);
});

test('it should trigger `initDirectionsService` on `parentView.map` change', function(assert) {
  run(() => component.set('parentView', { map: '' }));
  this.render();

  component.initDirectionsService = sinon.spy();
  run(() => component.set('parentView.map', {}));
  assert.ok(component.initDirectionsService.calledOnce);
});

test('it should trigger `updateRoute` on `initDirectionsService` call', function(assert) {
  this.render();

  component.updateRoute = sinon.spy();

  run(() => component.set('map', {}));
  run(() => component.initDirectionsService());

  assert.ok(component.updateRoute.calledOnce);
});

test('it should trigger `updateRoute` on `originLat` change', function(assert) {
  this.render();

  component.updateRoute = sinon.spy();
  run(() => component.set('originLat', 14));
  assert.ok(component.updateRoute.calledOnce);
});

test('it should trigger `updateRoute` on `originLng` change', function(assert) {
  this.render();

  component.updateRoute = sinon.spy();
  run(() => component.set('originLng', 13));
  assert.ok(component.updateRoute.calledOnce);
});

test('it should trigger `updateRoute` on `destinationLat` change', function(assert) {
  this.render();

  component.updateRoute = sinon.spy();
  run(() => component.set('destinationLat', 21));
  assert.ok(component.updateRoute.calledOnce);
});

test('it should trigger `updateRoute` on `destinationLng` change', function(assert) {
  this.render();

  component.updateRoute = sinon.spy();
  run(() => component.set('destinationLng', 21));
  assert.ok(component.updateRoute.calledOnce);
});

test('it should trigger `updateRoute` only once on several lat/lng changes', function(assert) {
  this.render();

  component.updateRoute = sinon.spy();
  run(() => component.setProperties({
    originLng: 25,
    destinationLng: 1,
    destinationLat: 11
  }));
  assert.ok(component.updateRoute.calledOnce);
});

test('it should call `route` of directionsService on `updateRoute`', function() {
  this.render();

  run(() => component.setProperties({
    originLat: 21,
    originLng: 25,
    destinationLng: 1,
    destinationLat: 11
  }));
  run(() => component.set('directionsService', fakeDirectionsService));
  run(() => component.set('directionsRenderer', fakeDirectionsRenderer));

  let origin = {};
  let destination = {};
  let stubbedLatLng = sinon.stub(google.maps, 'LatLng');
  stubbedLatLng.onCall(0).returns(origin);
  stubbedLatLng.onCall(1).returns(destination);

  fakeDirectionsService.route = sinon.stub();
  run(() => component.updateRoute());
  sinon.assert.calledOnce(fakeDirectionsService.route);

  let correctRequest = {
    origin: origin,
    destination: destination,
    travelMode: google.maps.TravelMode.DRIVING
  };
  sinon.assert.calledWith(fakeDirectionsService.route, correctRequest);

  google.maps.LatLng.restore();
});

test('it should call `setDirections` of directionsRenderer on `updateRoute`', function() {
  this.render();

  let response = {};
  let status = google.maps.DirectionsStatus.OK;
  fakeDirectionsService.route.callsArgWith(1, response, status);

  run(() => component.setProperties({
    originLat: 21,
    originLng: 25,
    destinationLng: 1,
    destinationLat: 11
  }));
  run(() => component.set('directionsService', fakeDirectionsService));
  run(() => component.set('directionsRenderer', fakeDirectionsRenderer));

  sinon.stub(google.maps, 'LatLng').returns({});
  run(() => component.updateRoute());

  sinon.assert.calledOnce(fakeDirectionsRenderer.setDirections);

  google.maps.LatLng.restore();
  fakeDirectionsService.route = sinon.stub();
});
