import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';
import { moduleForComponent } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';
import sinon from 'sinon';

let fakeMarkerObject, routeComponent, component;

moduleForComponent('g-map-route-waypoint', 'Unit | Component | g map route waypoint', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true,
  needs: ['component:g-map', 'component:g-map-route'],

  beforeEach() {
    const GMapComponent = getOwner(this).factoryFor('component:g-map');
    const GMapRouteComponent = getOwner(this).factoryFor('component:g-map-route');
    const mapComponent = GMapComponent.create();
    routeComponent = GMapRouteComponent.create({
      mapContext: mapComponent,
      registerWaypoint: sinon.stub(),
      unregisterWaypoint: sinon.stub()
    });
    component = this.subject({
      routeContext: routeComponent
    });
  }
});

test('it triggers `updateWaypoint` on `didInsertElement` event', function() {
  component.updateWaypoint = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.updateWaypoint);
});

test('it triggers `unregisterWaypoint` of routeContext on `willDestroyElement` event', function() {
  component.trigger('willDestroyElement');
  sinon.assert.calledOnce(routeComponent.unregisterWaypoint);
});

test('it triggers `updateWaypoint` on `lat` change', function() {
  component.updateWaypoint = sinon.stub();
  run(() => component.set('lat', 14));
  sinon.assert.calledOnce(component.updateWaypoint);
});

test('it triggers `updateWaypoint` on `lng` change', function() {
  component.updateWaypoint = sinon.stub();
  run(() => component.set('lng', 21));
  sinon.assert.calledOnce(component.updateWaypoint);
});

test('it triggers `updateWaypoint` only once on `lat` and `lng` change', function() {
  component.updateWaypoint = sinon.stub();
  run(() => component.setProperties({ lng: 1, lat: 11 }));
  sinon.assert.calledOnce(component.updateWaypoint);
});

test('it sets `waypoint` on `updateWaypoint` with lat/lng present', function(assert) {
  const point = { 'coords': '10/100' };
  sinon.stub(google.maps, 'LatLng').returns(point);

  run(() => component.setProperties({
    lat: 10,
    lng: 100,
    stopover: false
  }));
  run(() => component.updateWaypoint());

  assert.deepEqual(component.get('waypoint'), {
    location: point,
    stopover: false
  });

  google.maps.LatLng.restore();
});

test('it doesn\'t change `waypoint` on `updateWaypoint` when no lat present', function(assert) {
  run(() => component.setProperties({
    lng: 100,
    marker: fakeMarkerObject,
    waypoint: { location: { lat: 1, lng: 2 } }
  }));
  run(() => component.updateWaypoint());
  assert.deepEqual(component.get('waypoint'), { location: { lat: 1, lng: 2 } });
});

test('it doesn\'t change `waypoint` on `updateWaypoint` when no lng present', function(assert) {
  run(() => component.setProperties({
    lat: 100,
    marker: fakeMarkerObject,
    waypoint: { location: { lat: 1, lng: 2 } }
  }));
  run(() => component.updateWaypoint());
  assert.deepEqual(component.get('waypoint'), { location: { lat: 1, lng: 2 } });
});

test('it triggers `updateRoute` on `waypoint` change', function() {
  component.updateRoute = sinon.stub();
  run(() => component.set('waypoint', { value: 'new' }));
  sinon.assert.calledOnce(component.updateRoute);
});

test('it triggers `registerWaypoint` of routeContext on `updateRoute` if `waypoint` is present', function() {
  run(() => component.set('waypoint', { some: 'value' }));
  routeComponent.registerWaypoint = sinon.stub();

  run(() => component.updateRoute());
  sinon.assert.calledOnce(routeComponent.registerWaypoint);
});

test('it doesn\'t trigger `registerWaypoint` of routeContext on `updateRoute` without `waypoint`', function() {
  run(() => component.set('waypoint', undefined));
  routeComponent.registerWaypoint = sinon.stub();

  run(() => component.updateRoute());
  sinon.assert.notCalled(routeComponent.registerWaypoint);
});
