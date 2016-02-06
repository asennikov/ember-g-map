import Ember from 'ember';
import { moduleForComponent } from 'ember-qunit';
import test from '../../ember-sinon-qunit/test';
import GMapComponent from 'ember-g-map/components/g-map';
import sinon from 'sinon';

const { run } = Ember;

let fakeDirectionsService;
let fakeDirectionsRenderer;
let component;

moduleForComponent('g-map-route', 'Unit | Component | g map route', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true,

  beforeEach() {
    fakeDirectionsService = {
      route: sinon.stub()
    };
    fakeDirectionsRenderer = {
      setDirections: sinon.stub(),
      setMap: sinon.stub()
    };
    sinon.stub(google.maps, 'DirectionsRenderer').returns(fakeDirectionsRenderer);
    sinon.stub(google.maps, 'DirectionsService').returns(fakeDirectionsService);
    component = this.subject({
      mapContext: new GMapComponent()
    });
  },

  afterEach() {
    google.maps.DirectionsRenderer.restore();
    google.maps.DirectionsService.restore();
  }
});

test('it calls `initDirectionsService` on `didInsertElement`', function() {
  component.initDirectionsService = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.initDirectionsService);
});

test('it triggers `setMap` of renderer with null on `willDestroyElement` event if renderer is set', function() {
  run(() => component.set('directionsRenderer', fakeDirectionsRenderer));
  component.trigger('willDestroyElement');

  sinon.assert.calledOnce(fakeDirectionsRenderer.setMap);
  sinon.assert.calledWith(fakeDirectionsRenderer.setMap, null);
});

test('it doesn\'t trigger `setMap` of renderer on `willDestroyElement` event if there is no renderer', function() {
  run(() => component.set('directionsRenderer', undefined));
  fakeDirectionsRenderer.setMap = sinon.stub();
  component.trigger('willDestroyElement');
  sinon.assert.notCalled(fakeDirectionsRenderer.setMap);
});

test('it constructs new `DirectionsRenderer` on `initDirectionsService` call', function(assert) {
  const mapObject = {};
  run(() => component.set('map', mapObject));
  run(() => component.initDirectionsService());

  const correctRendererOptions = {
    map: mapObject,
    suppressMarkers: true,
    preserveViewport: true
  };

  sinon.assert.calledOnce(google.maps.DirectionsRenderer);
  sinon.assert.calledWith(google.maps.DirectionsRenderer, correctRendererOptions);
  assert.equal(component.get('directionsRenderer'), fakeDirectionsRenderer);
});

test('it constructs new `DirectionsService` on `initDirectionsService` call', function(assert) {
  run(() => component.set('map', {}));
  run(() => component.initDirectionsService());

  sinon.assert.calledOnce(google.maps.DirectionsService);
  assert.equal(component.get('directionsService'), fakeDirectionsService);
});

test('new `DirectionsService` and `DirectionsRenderer` isn\'t being constructed if they already present in component', function() {
  run(() => component.setProperties({
    directionsService: fakeDirectionsService,
    directionsRenderer: fakeDirectionsRenderer,
    map: {}
  }));
  run(() => component.initDirectionsService());

  sinon.assert.notCalled(google.maps.DirectionsService);
  sinon.assert.notCalled(google.maps.DirectionsRenderer);
});

test('it triggers `initDirectionsService` on `mapContext.map` change', function() {
  run(() => component.set('mapContext', { map: '' }));
  component.initDirectionsService = sinon.spy();
  run(() => component.set('mapContext.map', {}));
  sinon.assert.calledOnce(component.initDirectionsService);
});

test('it triggers `updateRoute` on `initDirectionsService` call', function() {
  component.updateRoute = sinon.spy();

  run(() => component.set('map', {}));
  run(() => component.initDirectionsService());

  sinon.assert.calledOnce(component.updateRoute);
});

test('it triggers `updateRoute` on `originLat` change', function() {
  component.updateRoute = sinon.spy();
  run(() => component.set('originLat', 14));
  sinon.assert.calledOnce(component.updateRoute);
});

test('it triggers `updateRoute` on `originLng` change', function() {
  component.updateRoute = sinon.spy();
  run(() => component.set('originLng', 13));
  sinon.assert.calledOnce(component.updateRoute);
});

test('it triggers `updateRoute` on `destinationLat` change', function() {
  component.updateRoute = sinon.spy();
  run(() => component.set('destinationLat', 21));
  sinon.assert.calledOnce(component.updateRoute);
});

test('it triggers `updateRoute` on `destinationLng` change', function() {
  component.updateRoute = sinon.spy();
  run(() => component.set('destinationLng', 21));
  sinon.assert.calledOnce(component.updateRoute);
});

test('it triggers `updateRoute` on `travelMode` change', function() {
  component.updateRoute = sinon.spy();
  run(() => component.set('travelMode', 'walking'));
  sinon.assert.calledOnce(component.updateRoute);
});

test('it triggers `updateRoute` only once on several lat/lng changes', function() {
  component.updateRoute = sinon.spy();
  run(() => component.setProperties({
    originLng: 25,
    destinationLng: 1,
    destinationLat: 11
  }));
  sinon.assert.calledOnce(component.updateRoute);
});

test('it calls `route` of directionsService on `updateRoute`', function() {
  run(() => component.setProperties({
    originLat: 21,
    originLng: 25,
    destinationLng: 1,
    destinationLat: 11
  }));
  run(() => component.set('directionsService', fakeDirectionsService));
  run(() => component.set('directionsRenderer', fakeDirectionsRenderer));

  const origin = {};
  const destination = {};
  const stubbedLatLng = sinon.stub(google.maps, 'LatLng');
  stubbedLatLng.onCall(0).returns(origin);
  stubbedLatLng.onCall(1).returns(destination);

  fakeDirectionsService.route = sinon.stub();
  run(() => component.updateRoute());

  const correctRequest = {
    origin: origin,
    destination: destination,
    travelMode: google.maps.TravelMode.DRIVING
  };

  sinon.assert.calledOnce(fakeDirectionsService.route);
  sinon.assert.calledWith(fakeDirectionsService.route, correctRequest);

  google.maps.LatLng.restore();
});

test('it calls `setDirections` of directionsRenderer on `updateRoute`', function() {
  const response = {};
  const status = google.maps.DirectionsStatus.OK;
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
