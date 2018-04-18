import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';
import { moduleForComponent } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';
import sinon from 'sinon';

let fakePlacesService, component;

moduleForComponent('g-map-address-marker', 'Unit | Component | g map address marker', {
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

test('it triggers `searchLocation` on `initPlacesService` call', function() {
  component.searchLocation = sinon.stub();

  run(() => component.set('map', {}));
  run(() => component.initPlacesService());

  sinon.assert.calledOnce(component.searchLocation);
});

test('it triggers `searchLocation` on `address` change', function() {
  component.searchLocation = sinon.stub();
  run(() => component.set('address', 'query string'));
  sinon.assert.calledOnce(component.searchLocation);
});

test('it calls `textSearch` of placesService on `searchLocation`', function() {
  run(() => component.set('address', 'query string'));
  run(() => component.set('placesService', fakePlacesService));

  fakePlacesService.textSearch = sinon.stub();
  run(() => component.searchLocation());

  const correctRequest = { query: 'query string' };

  sinon.assert.calledOnce(fakePlacesService.textSearch);
  sinon.assert.calledWith(fakePlacesService.textSearch, correctRequest);
});

test('it calls `updateLocation` after successful textSearch on `searchLocation`', function() {
  const results = [{ a: 1 }, { b: 2 }];
  const status = google.maps.places.PlacesServiceStatus.OK;

  run(() => component.set('address', 'query string'));
  run(() => component.set('placesService', fakePlacesService));

  fakePlacesService.textSearch.callsArgWith(1, results, status);
  component.updateLocation = sinon.stub();
  run(() => component.searchLocation());

  sinon.assert.calledOnce(component.updateLocation);
  sinon.assert.calledWith(component.updateLocation, results);
});

test('it sets `lat` & `lng` of the first provided result on `updateLocation`', function(assert) {
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
  run(() => component.updateLocation(results));

  assert.equal(component.get('lat'), 12);
  assert.equal(component.get('lng'), -20);
  assert.equal(component.get('viewport'), undefined);
});

test('it sets `lat` & `lng` & `viewport` on `updateLocation`', function(assert) {
  const results = [{
    geometry: {
      location: {
        lat: () => 12,
        lng: () => -20
      },
      viewport: {
        b: 14,
        f: 15
      }
    }
  }];

  run(() => component.set('attrs', {}));
  run(() => component.updateLocation(results));

  assert.equal(component.get('lat'), 12);
  assert.equal(component.get('lng'), -20);
  assert.equal(component.get('viewport.b'), 14);
  assert.equal(component.get('viewport.f'), 15);
});
test('it calls `sendOnLocationChange` on `updateLocation`', function() {
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

  component.sendOnLocationChange = sinon.stub();
  run(() => component.set('attrs', {}));
  run(() => component.updateLocation(results));

  sinon.assert.calledOnce(component.sendOnLocationChange);
  sinon.assert.calledWith(component.sendOnLocationChange, 12, -20, results);
});

test('it sends action `onLocationChange` on `sendOnLocationChange`', function() {
  const results = [{ a: 1 }, { b: 2 }];
  component.sendAction = sinon.stub();

  run(() => component.set('attrs', { onLocationChange: 'action' }));
  run(() => component.sendOnLocationChange(12, 30, results));

  sinon.assert.calledOnce(component.sendAction);
  sinon.assert.calledWith(component.sendAction, 'onLocationChange', 12, 30, results);
});

test('it runs closure action `attrs.onLocationChange` directly on `updateLocation`', function() {
  const results = [{ a: 1 }, { b: 2 }];
  run(() => component.set('attrs', { onLocationChange: sinon.stub() }));
  run(() => component.sendOnLocationChange(12, 30, results));

  sinon.assert.calledOnce(component.attrs.onLocationChange);
  sinon.assert.calledWith(component.attrs.onLocationChange, 12, 30, results);
});
