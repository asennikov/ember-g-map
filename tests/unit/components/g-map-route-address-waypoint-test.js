import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';
import { moduleForComponent } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';
import sinon from 'sinon';

let fakePlacesService, component;

moduleForComponent('g-map-route-address-waypoint', 'Unit | Component | g map route address waypoint', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true,
  needs: ['component:g-map', 'component:g-map-route'],

  beforeEach() {
    fakePlacesService = {
      textSearch: sinon.stub()
    };
    sinon.stub(google.maps.places, 'PlacesService').returns(fakePlacesService);

    const GMapComponent = getOwner(this).factoryFor('component:g-map');
    const GMapRouteComponent = getOwner(this).factoryFor('component:g-map-route');
    const mapComponent = GMapComponent.create();
    component = this.subject({
      routeContext: GMapRouteComponent.create({ mapContext: mapComponent })
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

test('it triggers `initPlacesService` on `routeContext.map` change', function() {
  run(() => component.set('routeContext', { map: '' }));
  component.initPlacesService = sinon.spy();
  run(() => component.set('routeContext.map', {}));
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
});
