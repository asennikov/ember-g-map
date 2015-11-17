import Ember from 'ember';
import { moduleForComponent } from 'ember-qunit';
import test from '../../ember-sinon-qunit/test';
import GMapComponent from 'ember-g-map/components/g-map';
import sinon from 'sinon';

const { run } = Ember;

let fakeMarkerObject;
let component;

moduleForComponent('g-map-marker', 'Unit | Component | g map marker', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true,

  beforeEach() {
    fakeMarkerObject = {
      setPosition: sinon.stub(),
      setIcon: sinon.stub(),
      setMap: sinon.stub(),
      addListener: sinon.stub()
    };
    sinon.stub(google.maps, 'Marker').returns(fakeMarkerObject);
    component = this.subject({
      mapContext: new GMapComponent()
    });
  },

  afterEach() {
    google.maps.Marker.restore();
  }
});

test('it constructs new `Marker` object on `didInsertElement` event', function(assert) {
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(google.maps.Marker);
  assert.equal(component.get('marker'), fakeMarkerObject);
});

test('new `Marker` isn\'t constructed if it already present in component', function() {
  run(() => component.set('marker', fakeMarkerObject));
  component.trigger('didInsertElement');
  sinon.assert.notCalled(google.maps.Marker);
});

test('it triggers `setMap` on `didInsertElement` event', function() {
  component.setMap = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setMap);
});

test('it triggers `setGroup` on `didInsertElement` event', function() {
  component.setGroup = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setGroup);
});

test('it triggers `unsetMarkerFromMap` on `willDestroyElement` event', function() {
  component.unsetMarkerFromMap = sinon.stub();
  component.trigger('willDestroyElement');
  sinon.assert.calledOnce(component.unsetMarkerFromMap);
});

test('it triggers `setMap` of marker with null during `unsetMarkerFromMap` if marker is set', function() {
  fakeMarkerObject.setMap = sinon.stub();

  run(() => component.set('marker', fakeMarkerObject));
  run(() => component.unsetMarkerFromMap());

  sinon.assert.calledOnce(fakeMarkerObject.setMap);
  sinon.assert.calledWith(fakeMarkerObject.setMap, null);
});

test('it doesn\'t trigger `setMap` of marker during `unsetMarkerFromMap` if there is no marker', function() {
  fakeMarkerObject.setMap = sinon.stub();

  run(() => component.set('marker', undefined));
  run(() => component.unsetMarkerFromMap());

  sinon.assert.notCalled(fakeMarkerObject.setMap);
});

test('it triggers `setMap` on `mapContext.map` change', function() {
  run(() => component.set('mapContext', { map: '' }));
  component.setMap = sinon.spy();
  run(() => component.set('mapContext.map', {}));
  sinon.assert.calledOnce(component.setMap);
});

test('it triggers `setGroup` on `group` change', function() {
  run(() => component.set('group', ''));
  component.setGroup = sinon.spy();
  run(() => component.set('group', {}));
  sinon.assert.calledOnce(component.setGroup);
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

test('it calls `setPosition` of google marker on `setPosition` with lat/lng present', function() {
  const point = {};
  sinon.stub(google.maps, 'LatLng').returns(point);

  run(() => component.setProperties({
    lat: 10,
    lng: 100,
    marker: fakeMarkerObject
  }));

  fakeMarkerObject.setPosition = sinon.stub();

  run(() => component.setPosition());

  sinon.assert.calledOnce(fakeMarkerObject.setPosition);
  sinon.assert.calledWith(fakeMarkerObject.setPosition, point);

  google.maps.LatLng.restore();
});

test('it doesn\'t call `setPosition` of google marker on `setPosition` when no lat present', function() {
  fakeMarkerObject.setPosition = sinon.stub();

  run(() => component.setProperties({
    lng: 100,
    marker: fakeMarkerObject
  }));
  run(() => component.setPosition());
  sinon.assert.notCalled(fakeMarkerObject.setPosition);
});

test('it doesn\'t call `setPosition` of google marker on `setPosition` when no lng present', function() {
  fakeMarkerObject.setPosition = sinon.stub();

  run(() => component.setProperties({
    lat: 10,
    marker: fakeMarkerObject
  }));
  run(() => component.setPosition());

  sinon.assert.notCalled(fakeMarkerObject.setPosition);
});

test('it calls `setMap` of google marker on `setMap` with `map` present', function() {
  const mapObject = {};
  run(() => component.setProperties({
    map: mapObject,
    marker: fakeMarkerObject
  }));

  fakeMarkerObject.setMap = sinon.stub();

  run(() => component.setMap());

  sinon.assert.calledOnce(fakeMarkerObject.setMap);
  sinon.assert.calledWith(fakeMarkerObject.setMap, mapObject);
});

test('it doesn\'t call `setMap` of google marker on `setMap` when no `map` present', function() {
  fakeMarkerObject.setMap = sinon.stub();
  run(() => component.setMap());
  sinon.assert.notCalled(fakeMarkerObject.setMap);
});

test('it triggers `setIcon` on `didInsertElement` event', function() {
  component.setIcon = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setIcon);
});

test('it triggers `setIcon` on `icon` change', function() {
  component.setIcon = sinon.stub();
  run(() => component.set('icon', 'image-src'));
  sinon.assert.calledOnce(component.setIcon);
});

test('it calls `setIcon` of google marker on `setIcon` with icon present', function() {
  run(() => component.setProperties({
    icon: 'image-src',
    marker: fakeMarkerObject
  }));

  fakeMarkerObject.setIcon = sinon.stub();

  run(() => component.setIcon());

  sinon.assert.calledOnce(fakeMarkerObject.setIcon);
  sinon.assert.calledWith(fakeMarkerObject.setIcon, 'image-src');
});

test('it doesn\'t call `setIcon` of google marker on `setIcon` when no icon present', function() {
  fakeMarkerObject.setIcon = sinon.stub();

  run(() => component.setProperties({
    icon: undefined,
    marker: fakeMarkerObject
  }));
  run(() => component.setIcon());

  sinon.assert.notCalled(fakeMarkerObject.setIcon);
});

test('it registers itself in parent\'s `markers` array on `init` event', function() {
  let mapContext;
  run(() => mapContext = component.get('mapContext'));
  mapContext.registerMarker = sinon.stub();

  component.trigger('init');

  sinon.assert.calledOnce(mapContext.registerMarker);
  sinon.assert.calledWith(mapContext.registerMarker, component);
});

test('it unregisters itself in parent\'s `markers` array on `willDestroyElement` event', function() {
  let mapContext;
  run(() => mapContext = component.get('mapContext'));
  mapContext.unregisterMarker = sinon.stub();

  component.trigger('willDestroyElement');

  sinon.assert.calledOnce(mapContext.unregisterMarker);
  sinon.assert.calledWith(mapContext.unregisterMarker, component);
});

test('it calls `addListener` of google marker on `setGroup` with `group` and `marker` present', function() {
  let mapContext;
  run(() => mapContext = component.get('mapContext'));
  mapContext.groupMarkerClicked = sinon.stub();

  run(() => component.setProperties({
    marker: fakeMarkerObject,
    group: 'cats'
  }));

  fakeMarkerObject.addListener = sinon.stub().callsArg(1);
  run(() => component.setGroup());

  sinon.assert.calledOnce(fakeMarkerObject.addListener);
  sinon.assert.calledWith(fakeMarkerObject.addListener, 'click');

  sinon.assert.calledOnce(mapContext.groupMarkerClicked);
  sinon.assert.calledWith(mapContext.groupMarkerClicked, component, 'cats');
});

test('it doesn\'t call `addListener` of google marker on `setGroup` when no `group` present', function() {
  let mapContext;
  run(() => mapContext = component.get('mapContext'));
  mapContext.groupMarkerClicked = sinon.stub();

  run(() => component.setProperties({
    marker: fakeMarkerObject
  }));

  run(() => component.setGroup());
  sinon.assert.notCalled(fakeMarkerObject.addListener);
  sinon.assert.notCalled(mapContext.groupMarkerClicked);
});

test('it calls `close` of infowindow on `closeInfowindow`', function() {
  const infowindow = { close: sinon.stub() };
  run(() => component.set('infowindow', infowindow));

  run(() => component.closeInfowindow());
  sinon.assert.calledOnce(infowindow.close);
});
