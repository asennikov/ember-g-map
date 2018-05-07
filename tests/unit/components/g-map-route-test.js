import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';
import { moduleForComponent } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';
import sinon from 'sinon';

let fakeDirectionsService, fakeDirectionsRenderer, component;

moduleForComponent('g-map-route', 'Unit | Component | g map route', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true,
  needs: ['component:g-map'],

  beforeEach() {
    fakeDirectionsService = {
      route: sinon.stub()
    };
    fakeDirectionsRenderer = {
      getDirections: sinon.stub(),
      setDirections: sinon.stub(),
      setMap: sinon.stub(),
      setOptions: sinon.stub()
    };
    sinon.stub(google.maps, 'DirectionsRenderer').returns(fakeDirectionsRenderer);
    sinon.stub(google.maps, 'DirectionsService').returns(fakeDirectionsService);
    const GMapComponent = getOwner(this).factoryFor('component:g-map');
    component = this.subject({
      mapContext: GMapComponent.create()
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
    origin,
    destination,
    travelMode: google.maps.TravelMode.DRIVING,
    waypoints: []
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

test('it triggers `updatePolylineOptions` on `initDirectionsService` call', function() {
  component.updatePolylineOptions = sinon.spy();

  run(() => component.set('map', {}));
  run(() => component.initDirectionsService());

  sinon.assert.calledOnce(component.updatePolylineOptions);
});

test('it triggers `updatePolylineOptions` on `strokeColor` change', function() {
  component.updatePolylineOptions = sinon.spy();
  run(() => component.set('strokeColor', '#000000'));
  sinon.assert.calledOnce(component.updatePolylineOptions);
});

test('it triggers `updatePolylineOptions` on `strokeWeight` change', function() {
  component.updatePolylineOptions = sinon.spy();
  run(() => component.set('strokeWeight', 5));
  sinon.assert.calledOnce(component.updatePolylineOptions);
});

test('it triggers `updatePolylineOptions` on `strokeOpacity` change', function() {
  component.updatePolylineOptions = sinon.spy();
  run(() => component.set('strokeOpacity', 0.1));
  sinon.assert.calledOnce(component.updatePolylineOptions);
});

test('it triggers `updatePolylineOptions` on `zIndex` change', function() {
  component.updatePolylineOptions = sinon.spy();
  run(() => component.set('zIndex', 2));
  sinon.assert.calledOnce(component.updatePolylineOptions);
});

test('it triggers `updatePolylineOptions` only once on several option changes', function() {
  component.updatePolylineOptions = sinon.spy();
  run(() => component.setProperties({
    strokeWeight: 2,
    strokeOpacity: 0.5,
    zIndex: 4
  }));
  sinon.assert.calledOnce(component.updatePolylineOptions);
});

test('it calls `setOptions` of directionsRenderer on `updatePolylineOptions`', function() {
  const polylineOptions = {
    strokeColor: '#ffffff',
    strokeWeight: 2,
    strokeOpacity: 1,
    zIndex: 1
  };
  run(() => component.setProperties(polylineOptions));
  run(() => component.set('directionsRenderer', fakeDirectionsRenderer));

  run(() => component.updatePolylineOptions());

  sinon.assert.calledOnce(fakeDirectionsRenderer.setOptions);
  sinon.assert.calledWith(fakeDirectionsRenderer.setOptions, { polylineOptions });
});

test('it doesn\'t call `setOptions` of directionsRenderer on `updatePolylineOptions` if no options are provided', function() {
  run(() => component.set('directionsRenderer', fakeDirectionsRenderer));
  run(() => component.updatePolylineOptions());
  sinon.assert.notCalled(fakeDirectionsRenderer.setOptions);
});

test('it calls `setDirections` of directionsRenderer on `updatePolylineOptions` if `getDirections` return something', function() {
  fakeDirectionsRenderer.getDirections.returns(['a', 'b']);

  run(() => component.set('strokeColor', '#ffffff'));
  run(() => component.set('directionsRenderer', fakeDirectionsRenderer));

  run(() => component.updatePolylineOptions());

  sinon.assert.calledOnce(fakeDirectionsRenderer.setDirections);
  sinon.assert.calledWith(fakeDirectionsRenderer.setDirections, ['a', 'b']);
});

test('it doesn\'t call `setDirections` of directionsRenderer on `updatePolylineOptions` if `getDirections` return nothing', function() {
  fakeDirectionsRenderer.getDirections.returns([]);

  run(() => component.set('strokeColor', '#ffffff'));
  run(() => component.set('directionsRenderer', fakeDirectionsRenderer));

  run(() => component.updatePolylineOptions());

  sinon.assert.notCalled(fakeDirectionsRenderer.setDirections);
});

test('it registers waypoint in `waypoints` array during `registerWaypoint`', function(assert) {
  const component = this.subject();
  this.render();

  const firstWaypoint = { name: 'first' };
  const secondWaypoint = { name: 'second' };
  const thirdWaypoint = { name: 'third' };

  run(() => component.get('waypoints').addObject(firstWaypoint));
  run(() => component.registerWaypoint(secondWaypoint));
  run(() => component.registerWaypoint(thirdWaypoint));

  assert.equal(component.get('waypoints').length, 3);
  assert.equal(component.get('waypoints')[1], secondWaypoint);
  assert.equal(component.get('waypoints')[2], thirdWaypoint);
});

test('it unregisters waypoint from `waypoints` array during `unregisterWaypoint`', function(assert) {
  const component = this.subject();
  this.render();

  const firstWaypoint = { name: 'first' };
  const secondWaypoint = { name: 'second' };
  const thirdWaypoint = { name: 'third' };

  run(() => component.get('waypoints').addObjects([firstWaypoint, secondWaypoint, thirdWaypoint]));
  run(() => component.unregisterWaypoint(secondWaypoint));

  assert.equal(component.get('waypoints').length, 2);
  assert.equal(component.get('waypoints')[0], firstWaypoint);
  assert.equal(component.get('waypoints')[1], thirdWaypoint);
});

test('it triggers `updateRoute` on change of one of `waypoints` location', function() {
  run(() => component.get('waypoints').addObjects([
    { location: { oldValue: true } },
    { location: { anotherOldValue: true } }
  ]));
  component.updateRoute = sinon.spy();
  run(() => component.set('waypoints.firstObject.location', { newValue: true }));
  sinon.assert.calledOnce(component.updateRoute);
});

test('it triggers `updateRoute` on addition to `waypoints`', function() {
  run(() => component.get('waypoints').addObjects([
    { location: { oldValue: true } }
  ]));
  component.updateRoute = sinon.spy();
  run(() => component.get('waypoints').addObject({ location: { newValue: true } }));
  sinon.assert.calledOnce(component.updateRoute);
});

test('it triggers `updateRoute` when one of `waypoints` is removed', function() {
  run(() => component.get('waypoints').addObjects([
    { location: { oldValue: true } },
    { location: { anotherOldValue: true } }
  ]));
  const lastWaypoint = component.get('waypoints.lastObject');

  component.updateRoute = sinon.spy();
  run(() => component.get('waypoints').removeObject(lastWaypoint));

  sinon.assert.calledOnce(component.updateRoute);
});

test('it triggers `updateRoute` only once on several changes tp `waypoints`', function() {
  run(() => component.get('waypoints').addObjects([
    { location: { oldValue: true } },
    { location: { anotherOldValue: true } }
  ]));
  const lastWaypoint = component.get('waypoints.lastObject');

  component.updateRoute = sinon.spy();
  run(() => {
    component.get('waypoints').addObject({ location: { newValue: true } });
    component.get('waypoints').removeObject(lastWaypoint);
    component.set('waypoints.firstObject.location', { newValue: true });
  });

  sinon.assert.calledOnce(component.updateRoute);
});
