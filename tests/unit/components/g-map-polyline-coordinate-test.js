import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';
import { moduleForComponent } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';
import sinon from 'sinon';

let fakePolylineCoordinateObject, component;

moduleForComponent('g-map-polyline-coordinate', 'Unit | Component | g map polyline coordinate', {
  // Specify the other units that are required for this test
  unit: true,
  needs: ['component:g-map', 'component:g-map-polyline'],

  beforeEach() {
    fakePolylineCoordinateObject = {
      setPosition: sinon.stub()
    };
    sinon.stub(google.maps, 'LatLng').returns(fakePolylineCoordinateObject);
    const GMapComponent = getOwner(this).factoryFor('component:g-map');
    const GMapPolylineComponent = getOwner(this).factoryFor('component:g-map-polyline');
    const mapComponent = GMapComponent.create();
    component = this.subject({
      polylineContext: GMapPolylineComponent.create({ mapContext: mapComponent })
    });
  },

  afterEach() {
    google.maps.LatLng.restore();
  }
});

test('it constructs new `LatLng` object on `didInsertElement` event', function(assert) {
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(google.maps.LatLng);
  assert.equal(component.get('coordinate'), fakePolylineCoordinateObject);
});

test('new `LatLng` isn\'t constructed if it already present in component', function() {
  run(() => component.set('coordinate', fakePolylineCoordinateObject));
  component.trigger('didInsertElement');
  sinon.assert.notCalled(google.maps.LatLng);
});

test('it triggers `setPosition` on `didInsertElement` event', function() {
  component.setPosition = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setPosition);
});

test('it triggers `setPosition` on `lat` change', function() {
  component.setPosition = sinon.stub();
  run(() => component.set('lat', 14));
  sinon.assert.calledOnce(component.setPosition);
});

test('it triggers `setPosition` on `lng` change', function() {
  component.setPosition = sinon.stub();
  run(() => component.set('lng', 21));
  sinon.assert.calledOnce(component.setPosition);
});

test('it triggers `setPosition` only once on `lat` and `lng` change', function() {
  component.setPosition = sinon.stub();
  run(() => component.setProperties({ lng: 1, lat: 11 }));
  sinon.assert.calledOnce(component.setPosition);
});

test('it calls `setPath` of google polyline on `setPosition` with coordinates present', function() {
  const fakePolylineObject = {
    setPath: sinon.stub()
  };
  run(() => component.setProperties({
    lat: 10,
    lng: 100,
    polylineContext: fakePolylineObject
  }));
  run(() => component.setPosition());
  sinon.assert.called(fakePolylineObject.setPath);
});

test('it doesn\'t call `setPosition` of google polyline on `setPosition` when no lat present', function() {
  const fakePolylineObject = {
    setPath: sinon.stub()
  };
  run(() => component.setProperties({
    lng: 100,
    polylineContext: fakePolylineObject
  }));

  run(() => component.setPosition());
  sinon.assert.notCalled(fakePolylineCoordinateObject.setPosition);
});

test('it doesn\'t call `setPosition` of google polyline on `setPosition` when no lng present', function() {
  const fakePolylineObject = {
    setPath: sinon.stub()
  };
  run(() => component.setProperties({
    lat: 100,
    polylineContext: fakePolylineObject
  }));

  run(() => component.setPosition());
  sinon.assert.notCalled(fakePolylineCoordinateObject.setPosition);
});

test('it registers itself in parent\'s `coordinates` array on `init` event', function() {
  let polylineContext;
  run(() => polylineContext = component.get('polylineContext'));
  polylineContext.registerCoordinate = sinon.stub();

  component.trigger('init');

  sinon.assert.calledOnce(polylineContext.registerCoordinate);
  sinon.assert.calledWith(polylineContext.registerCoordinate, component);
});

test('it unregisters itself in parent\'s `coordinates` array on `willDestroyElement` event', function() {
  let polylineContext;
  run(() => polylineContext = component.get('polylineContext'));
  polylineContext.unregisterCoordinate = sinon.stub();

  component.trigger('willDestroyElement');

  sinon.assert.calledOnce(polylineContext.unregisterCoordinate);
  sinon.assert.calledWith(polylineContext.unregisterCoordinate, component);
});
