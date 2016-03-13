import Ember from 'ember';
import { moduleForComponent } from 'ember-qunit';
import test from '../../ember-sinon-qunit/test';
import GMapComponent from 'ember-g-map/components/g-map';
import sinon from 'sinon';

const { run } = Ember;

let fakeDirectionsService;
let fakeDirectionsRenderer;
let component;

moduleForComponent('g-map-address-route', 'Unit | Component | g map address route', {
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

test('it triggers `updateRoute` on `originAddress` change', function() {
  component.updateRoute = sinon.spy();
  run(() => component.set('originAddress', 'Los Angeles, California'));
  sinon.assert.calledOnce(component.updateRoute);
});

test('it triggers `updateRoute` on `destinationAddress` change', function() {
  component.updateRoute = sinon.spy();
  run(() => component.set('destinationAddress', 'San Francisco, California'));
  sinon.assert.calledOnce(component.updateRoute);
});

test('it triggers `updateRoute` on `travelMode` change', function() {
  component.updateRoute = sinon.spy();
  run(() => component.set('travelMode', 'walking'));
  sinon.assert.calledOnce(component.updateRoute);
});
