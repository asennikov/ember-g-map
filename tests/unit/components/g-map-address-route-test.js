import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';
import { moduleForComponent } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';
import sinon from 'sinon';

let fakePlacesService, component;

moduleForComponent('g-map-address-route', 'Unit | Component | g map address route', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true,
  needs: ['component:g-map'],

  beforeEach() {
    fakePlacesService = {
      textSearch: sinon.stub()
    };
    sinon.stub(google.maps.places, 'PlacesService').returns(fakePlacesService);
    const GMapComponent = getOwner(this).factoryFor('component:g-map');
    component = this.subject({
      mapContext: GMapComponent.create()
    });
  },

  afterEach() {
    google.maps.places.PlacesService.restore();
  }
});

test('it calls `initPlacesService` on `didInsertElement`', function() {
  component.initPlacesService = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.initPlacesService);
});

test('it constructs new `PlacesService` on `initPlacesService` call', function(assert) {
  run(() => component.set('map', {}));
  run(() => component.initPlacesService());

  sinon.assert.calledOnce(google.maps.places.PlacesService);
  assert.equal(component.get('placesService'), fakePlacesService);
});

test('new `PlacesService` isn\'t being constructed if it\'s already present in component', function() {
  run(() => component.setProperties({
    placesService: fakePlacesService,
    map: {}
  }));
  run(() => component.initPlacesService());

  sinon.assert.notCalled(google.maps.places.PlacesService);
});

test('it triggers `initPlacesService` on `mapContext.map` change', function() {
  run(() => component.set('mapContext', { map: '' }));
  component.initPlacesService = sinon.spy();
  run(() => component.set('mapContext.map', {}));
  sinon.assert.calledOnce(component.initPlacesService);
});

test('it triggers `searchLocations` on `initPlacesService` call', function() {
  component.searchLocations = sinon.stub();

  run(() => component.set('map', {}));
  run(() => component.initPlacesService());

  sinon.assert.calledOnce(component.searchLocations);
});

test('it triggers `searchLocations` on `originAddress` change', function() {
  component.searchLocations = sinon.stub();
  run(() => component.set('originAddress', 'query string'));
  sinon.assert.calledOnce(component.searchLocations);
});

test('it triggers `searchLocations` on `destinationAddress` change', function() {
  component.searchLocations = sinon.stub();
  run(() => component.set('destinationAddress', 'query string'));
  sinon.assert.calledOnce(component.searchLocations);
});

test('it calls `textSearch` of placesService on `searchLocations`', function() {
  run(() => component.set('originAddress', 'query string'));
  run(() => component.set('destinationAddress', 'query string'));
  run(() => component.set('placesService', fakePlacesService));

  fakePlacesService.textSearch = sinon.stub();
  run(() => component.searchLocations());

  const correctOriginRequest = { query: 'query string' };
  const correctDestinationRequest = { query: 'query string' };

  sinon.assert.calledTwice(fakePlacesService.textSearch);
  sinon.assert.calledWith(fakePlacesService.textSearch, correctOriginRequest);
  sinon.assert.calledWith(fakePlacesService.textSearch, correctDestinationRequest);
});

test('it calls `updateOriginLocation` after successful textSearch on `searchLocations`', function() {
  const results = [{ a: 1 }, { b: 2 }];
  const status = google.maps.places.PlacesServiceStatus.OK;

  run(() => component.set('originAddress', 'query string'));
  run(() => component.set('placesService', fakePlacesService));

  fakePlacesService.textSearch.callsArgWith(1, results, status);
  component.updateOriginLocation = sinon.stub();
  run(() => component.searchLocations());

  sinon.assert.calledOnce(component.updateOriginLocation);
  sinon.assert.calledWith(component.updateOriginLocation, results);
});

test('it calls `updateDestinationLocation` after successful textSearch on `searchLocations`', function() {
  const results = [{ a: 1 }, { b: 2 }];
  const status = google.maps.places.PlacesServiceStatus.OK;

  run(() => component.set('destinationAddress', 'query string'));
  run(() => component.set('placesService', fakePlacesService));

  fakePlacesService.textSearch.callsArgWith(1, results, status);
  component.updateDestinationLocation = sinon.stub();
  run(() => component.searchLocations());

  sinon.assert.calledOnce(component.updateDestinationLocation);
  sinon.assert.calledWith(component.updateDestinationLocation, results);
});

test('it sets `originLat` & `originLng` of the first provided result on `updateOriginLocation`', function(assert) {
  const results = [{
    geometry: {
      location: {
        lat: () => 12,
        lng: () => -20
      }
    }
  }, {
    geometry: {
      location: {
        lat: () => 24,
        lng: () => 100
      }
    }
  }];

  run(() => component.set('attrs', {}));
  run(() => component.updateOriginLocation(results));

  assert.equal(component.get('originLat'), 12);
  assert.equal(component.get('originLng'), -20);
});

test('it sets `destinationLat` & `destinationLng` of the first provided result on `updateDestinationLocation`', function(assert) {
  const results = [{
    geometry: {
      location: {
        lat: () => 12,
        lng: () => -20
      }
    }
  }, {
    geometry: {
      location: {
        lat: () => 24,
        lng: () => 100
      }
    }
  }];

  run(() => component.set('attrs', {}));
  run(() => component.updateDestinationLocation(results));

  assert.equal(component.get('destinationLat'), 12);
  assert.equal(component.get('destinationLng'), -20);
});

test('it calls `sendOnLocationsChange` on `updateOriginLocation`', function() {
  const results = [{
    geometry: {
      location: {
        lat: () => 12,
        lng: () => -20
      }
    }
  }, {
    geometry: {
      location: {
        lat: () => 24,
        lng: () => 100
      }
    }
  }];

  component.sendOnLocationsChange = sinon.stub();
  run(() => component.set('attrs', {}));
  run(() => component.updateOriginLocation(results));

  sinon.assert.calledOnce(component.sendOnLocationsChange);
  sinon.assert.calledWith(component.sendOnLocationsChange, 12, -20, results);
});

test('it calls `sendOnLocationsChange` on `updateDestinationLocation`', function() {
  const results = [{
    geometry: {
      location: {
        lat: () => 12,
        lng: () => -20
      }
    }
  }, {
    geometry: {
      location: {
        lat: () => 24,
        lng: () => 100
      }
    }
  }];

  component.sendOnLocationsChange = sinon.stub();
  run(() => component.set('attrs', {}));
  run(() => component.updateDestinationLocation(results));

  sinon.assert.calledOnce(component.sendOnLocationsChange);
  sinon.assert.calledWith(component.sendOnLocationsChange, 12, -20, results);
});

test('it sends action `onLocationsChange` on `sendOnLocationsChange`', function() {
  const results = [{ a: 1 }, { b: 2 }];
  component.sendAction = sinon.stub();

  run(() => component.set('attrs', { onLocationsChange: 'action' }));
  run(() => component.sendOnLocationsChange(12, 30, results));

  sinon.assert.calledOnce(component.sendAction);
  sinon.assert.calledWith(component.sendAction, 'onLocationsChange', 12, 30, results);
});

test('it runs closure action `attrs.onLocationsChange` directly on `updateOriginLocation` and `updateDestinationLocation`', function() {
  const results = [{ a: 1 }, { b: 2 }];
  run(() => component.set('attrs', { onLocationsChange: sinon.stub() }));
  run(() => component.sendOnLocationsChange(12, 30, results));

  sinon.assert.calledOnce(component.attrs.onLocationsChange);
  sinon.assert.calledWith(component.attrs.onLocationsChange, 12, 30, results);
});
