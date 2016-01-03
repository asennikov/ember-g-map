import Ember from 'ember';
import { moduleForComponent } from 'ember-qunit';
import test from '../../ember-sinon-qunit/test';
import GMapComponent from 'ember-g-map/components/g-map';
import sinon from 'sinon';

const { run } = Ember;

let fakePlacesService;
let component;

moduleForComponent('g-map-address-marker', 'Unit | Component | g map address marker', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true,

  beforeEach() {
    fakePlacesService = {
      textSearch: sinon.stub()
    };
    sinon.stub(google.maps.places, 'PlacesService').returns(fakePlacesService);
    component = this.subject({
      mapContext: new GMapComponent()
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

test('it triggers `updateLocation` on `initPlacesService` call', function() {
  component.updateLocation = sinon.spy();

  run(() => component.set('map', {}));
  run(() => component.initPlacesService());

  sinon.assert.calledOnce(component.updateLocation);
});

test('it triggers `updateLocation` on `address` change', function() {
  component.updateLocation = sinon.spy();
  run(() => component.set('address', 'query string'));
  sinon.assert.calledOnce(component.updateLocation);
});

test('it calls `textSearch` of placesService on `updateLocation`', function() {
  run(() => component.set('address', 'query string'));
  run(() => component.set('placesService', fakePlacesService));

  fakePlacesService.textSearch = sinon.stub();
  run(() => component.updateLocation());

  const correctRequest = { query: 'query string' };

  sinon.assert.calledOnce(fakePlacesService.textSearch);
  sinon.assert.calledWith(fakePlacesService.textSearch, correctRequest);
});

test('it sets `lat` & `lng` of the first textSearch result on `updateLocation`', function(assert) {
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
  const status = google.maps.places.PlacesServiceStatus.OK;
  fakePlacesService.textSearch.callsArgWith(1, results, status);

  run(() => component.set('address', 'query string'));
  run(() => component.set('placesService', fakePlacesService));

  run(() => component.updateLocation());

  assert.equal(component.get('lat'), 12);
  assert.equal(component.get('lng'), -20);

  fakePlacesService.textSearch = sinon.stub();
});
