import Ember from 'ember';
import { moduleForComponent } from 'ember-qunit';
import test from '../../ember-sinon-qunit/test';
import sinon from 'sinon';

const { run } = Ember;

let component, fakeMapObject, fakePlacesService;

function fakeJquery() {
  return {
    find: () => {
      return { get: () => 'jquery-object' };
    }
  };
}

moduleForComponent('g-map', 'Unit | Component | g map', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true,

  beforeEach() {
    fakeMapObject = {
      setCenter: sinon.stub(),
      setOptions: sinon.stub(),
      setZoom: sinon.stub(),
      fitBounds: sinon.stub()
    };
    fakePlacesService = {
      start: sinon.stub()
    };
    sinon.stub(google.maps, 'Map').returns(fakeMapObject);
    component = this.subject({
      places: fakePlacesService,
      $: fakeJquery
    });
  },

  afterEach() {
    google.maps.Map.restore();
  }
});

test('it constructs new `Map` object on `didInsertElement` event', function(assert) {
  component.trigger('didInsertElement');

  sinon.assert.calledOnce(google.maps.Map);
  assert.equal(component.get('map'), fakeMapObject);
});

test('it constructs new `Map` object with given custom options on `didInsertElement` event', function() {
  component.setProperties({
    options: {
      googleMapOption: 123
    }
  });
  component.trigger('didInsertElement');

  const canvasElement = this.$().find('.g-map-canvas').get(0);
  sinon.assert.calledWith(google.maps.Map, canvasElement, { googleMapOption: 123 });
});

test('it constructs new `Map` object with custom options except banned on `didInsertElement` event', function() {
  component.setProperties({
    bannedOptions: Ember.A(['bannedOption']),
    options: {
      firstOption: 111,
      secondOption: 222,
      bannedOption: 333
    }
  });
  component.trigger('didInsertElement');

  const canvasElement = this.$().find('.g-map-canvas').get(0);
  const expectedOptions = {
    firstOption: 111,
    secondOption: 222
  };
  sinon.assert.calledWith(google.maps.Map, canvasElement, expectedOptions);
});

test('new `Map` isn\'t constructed if it already present on `didInsertElement` event', function() {
  component.set('map', fakeMapObject);
  component.trigger('didInsertElement');

  sinon.assert.notCalled(google.maps.Map);
});

test('it triggers `setZoom` on `didInsertElement` event', function() {
  component.setZoom = sinon.spy();
  component.trigger('didInsertElement');

  sinon.assert.calledOnce(component.setZoom);
});

test('it triggers `setCenter` on `didInsertElement` event', function() {
  component.setCenter = sinon.spy();
  component.trigger('didInsertElement');

  sinon.assert.calledOnce(component.setCenter);
});

test('it triggers `setOptions` on `permittedOptions` change', function() {
  run(() => component.set('permittedOptions', {
    firstOption: '11'
  }));

  component.setOptions = sinon.spy();
  run(() => component.set('permittedOptions', {
    firstOption: '22'
  }));
  sinon.assert.calledOnce(component.setOptions);
});

test('it triggers `setZoom` on `zoom` change', function() {
  component.setZoom = sinon.spy();
  run(() => component.set('zoom', 14));
  sinon.assert.calledOnce(component.setZoom);
});

test('it triggers `setCenter` on `lat` change', function() {
  component.setCenter = sinon.spy();
  run(() => component.set('lat', 14));
  sinon.assert.calledOnce(component.setCenter);
});

test('it triggers `setCenter` on `lng` change', function() {
  component.setCenter = sinon.spy();
  run(() => component.set('lng', 21));
  sinon.assert.calledOnce(component.setCenter);
});

test('it triggers `setCenter` only once on `lat` and `lng` change', function() {
  component.setCenter = sinon.spy();
  run(() => component.setProperties({
    lng: 1,
    lat: 11
  }));
  sinon.assert.calledOnce(component.setCenter);
});

test('it calls `setOptions` of google map on `setOptions`', function() {
  run(() => component.setProperties({
    map: fakeMapObject,
    permittedOptions: {
      firstOption: 123
    }
  }));

  fakeMapObject.setOptions = sinon.stub();
  run(() => component.setOptions());
  sinon.assert.calledOnce(fakeMapObject.setOptions);
  sinon.assert.calledWith(fakeMapObject.setOptions, { firstOption: 123 });
});

test('it calls `setCenter` of google map on `setCenter` with lat/lng present', function() {
  run(() => component.setProperties({
    map: fakeMapObject,
    lat: 10, lng: 100
  }));

  fakeMapObject.setCenter = sinon.stub();
  const point = {};
  sinon.stub(google.maps, 'LatLng').returns(point);
  run(() => component.setCenter());

  sinon.assert.calledOnce(fakeMapObject.setCenter);
  sinon.assert.calledWith(fakeMapObject.setCenter, point);

  google.maps.LatLng.restore();
});

test('it calls `setZoom` of google map on `setZoom`', function() {
  run(() => component.setProperties({
    map: fakeMapObject,
    zoom: 14
  }));

  fakeMapObject.setZoom = sinon.stub();
  run(() => component.setZoom());
  sinon.assert.calledOnce(fakeMapObject.setZoom);
  sinon.assert.calledWith(fakeMapObject.setZoom, 14);
});

test('it doesn\'t call `setCenter` of google map on `setCenter` when no lat present', function() {
  run(() => component.setProperties({
    map: fakeMapObject,
    lat: 10
  }));

  fakeMapObject.setCenter = sinon.stub();
  run(() => component.setCenter());
  sinon.assert.notCalled(fakeMapObject.setCenter);
});

test('it doesn\'t call `setCenter` of google map on `setCenter` when no lng present', function() {
  run(() => component.setProperties({
    map: fakeMapObject,
    lng: 10
  }));

  fakeMapObject.setCenter = sinon.stub();
  run(() => component.setCenter());
  sinon.assert.notCalled(fakeMapObject.setCenter);
});

test('it calls `fitToMarkers` object on `didInsertElement` if shouldFit is set to true', function() {
  component.set('shouldFit', true);

  component.fitToMarkers = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.fitToMarkers);
});

test('it calls `fitToMarkers` object on `didInsertElement` if markersFitMode is "init"', function() {
  component.set('markersFitMode', 'init');

  component.fitToMarkers = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.fitToMarkers);
});

test('it calls `fitToMarkers` object on `didInsertElement` if markersFitMode is "live"', function() {
  component.set('markersFitMode', 'live');

  component.fitToMarkers = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.fitToMarkers);
});

test('it doesn\'t call `fitToMarkers` object on `didInsertElement` if shouldFit is falsy', function() {
  component.set('shouldFit', null);

  component.fitToMarkers = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.notCalled(component.fitToMarkers);
});

test('it doesn\'t call `fitToMarkers` object on `didInsertElement` if markersFitMode has unexpected value', function() {
  component.set('markersFitMode', 'random-value');

  component.fitToMarkers = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.notCalled(component.fitToMarkers);
});

test('it triggers `fitToMarkers` on new marker added with markersFitMode set to "live"', function() {
  const firstMarker = Ember.Object.create({ lat: 1, lng: 2 });
  const secondMarker = Ember.Object.create({ lat: 3, lng: 4 });
  component.set('markersFitMode', 'live');

  component.fitToMarkers = sinon.stub();
  run(() => component.get('markers').addObject(firstMarker));
  component.fitToMarkers.reset();
  run(() => component.get('markers').addObject(secondMarker));
  sinon.assert.calledOnce(component.fitToMarkers);
});

test('it triggers `fitToMarkers` only once on `lat`/`lng` change of markers with markersFitMode set to "live"', function() {
  const firstMarker = Ember.Object.create({ lat: 1, lng: 2 });
  const secondMarker = Ember.Object.create({ lat: 3, lng: 4 });
  component.set('markersFitMode', 'live');

  component.fitToMarkers = sinon.stub();
  run(() => component.get('markers').addObjects([firstMarker, secondMarker]));
  component.fitToMarkers.reset();
  run(() => {
    firstMarker.setProperties({ lng: 4, lat: 5 });
    secondMarker.setProperties({ lng: 6, lat: 7 });
  });
  sinon.assert.calledOnce(component.fitToMarkers);
});

test('it doesn\'t trigger `fitToMarkers` with markersFitMode !== "live"', function() {
  const firstMarker = Ember.Object.create({ lat: 1, lng: 2 });
  const secondMarker = Ember.Object.create({ lat: 3, lng: 4 });
  component.set('markersFitMode', 'init');

  run(() => component.get('markers').addObject(firstMarker));
  component.fitToMarkers = sinon.spy();
  run(() => firstMarker.setProperties({ lng: 4, lat: 5 }));
  run(() => component.get('markers').addObject(secondMarker));
  sinon.assert.notCalled(component.fitToMarkers);
});

test('it calls `fitBounds` of google map on `fitToMarkers`', function() {
  const firstMarker = Ember.Object.create({ lat: 1, lng: 2 });
  const secondMarker = Ember.Object.create({ lat: 3, lng: 4 });
  component.set('map', fakeMapObject);

  fakeMapObject.fitBounds = sinon.stub();

  const fakeLatLngBounds = {
    extend: sinon.stub()
  };
  sinon.stub(google.maps, 'LatLngBounds').returns(fakeLatLngBounds);

  const stubbedLatLng = sinon.stub(google.maps, 'LatLng');
  stubbedLatLng.onCall(0).returns(firstMarker);
  stubbedLatLng.onCall(1).returns(secondMarker);

  run(() => component.set('markers', [ firstMarker, secondMarker ]));
  run(() => component.fitToMarkers());
  sinon.assert.calledOnce(google.maps.LatLngBounds);

  sinon.assert.calledTwice(google.maps.LatLng);
  sinon.assert.calledWith(google.maps.LatLng, 1, 2);
  sinon.assert.calledWith(google.maps.LatLng, 3, 4);

  sinon.assert.calledTwice(fakeLatLngBounds.extend);
  sinon.assert.calledWith(fakeLatLngBounds.extend, firstMarker);
  sinon.assert.calledWith(fakeLatLngBounds.extend, secondMarker);

  sinon.assert.calledOnce(fakeMapObject.fitBounds);
  sinon.assert.calledWith(fakeMapObject.fitBounds, fakeLatLngBounds);

  google.maps.LatLng.restore();
  google.maps.LatLngBounds.restore();
});

test('it registers marker in `markers` array during `registerMarker`', function(assert) {
  const firstMarker = { name: 'first' };
  const secondMarker = { name: 'second' };
  const thirdMarker = { name: 'third' };

  run(() => component.get('markers').addObject(firstMarker));
  run(() => component.registerMarker(secondMarker));
  run(() => component.registerMarker(thirdMarker));

  assert.equal(component.get('markers').length, 3);
  assert.equal(component.get('markers')[1], secondMarker);
  assert.equal(component.get('markers')[2], thirdMarker);
});

test('it unregisters marker from `markers` array during `unregisterMarker`', function(assert) {
  const firstMarker = { name: 'first' };
  const secondMarker = { name: 'second' };
  const thirdMarker = { name: 'third' };

  run(() => component.get('markers').addObjects([firstMarker, secondMarker, thirdMarker]));
  run(() => component.unregisterMarker(secondMarker));

  assert.equal(component.get('markers').length, 2);
  assert.equal(component.get('markers')[0], firstMarker);
  assert.equal(component.get('markers')[1], thirdMarker);
});

test('it calls `closeInfowindow` for each marker in group on `groupMarkerClicked`', function() {
  const firstMarker = Ember.Object.create({ group: 'blue' });
  const secondMarker = Ember.Object.create({ group: 'black' });
  const thirdMarker = Ember.Object.create({ group: 'blue' });
  const fourthMarker = Ember.Object.create({ group: 'blue' });
  const markers = Ember.A([ firstMarker, secondMarker, thirdMarker, fourthMarker ]);
  markers.forEach((marker) => marker.closeInfowindow = sinon.stub());

  run(() => component.set('markers', markers));
  run(() => component.groupMarkerClicked(thirdMarker, 'blue'));

  sinon.assert.calledOnce(firstMarker.closeInfowindow);
  sinon.assert.notCalled(secondMarker.closeInfowindow);
  sinon.assert.notCalled(thirdMarker.closeInfowindow);
  sinon.assert.calledOnce(fourthMarker.closeInfowindow);
});
