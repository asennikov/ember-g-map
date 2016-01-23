import Ember from 'ember';
import { moduleForComponent } from 'ember-qunit';
import test from '../../ember-sinon-qunit/test';
import GMapComponent from 'ember-g-map/components/g-map';
import sinon from 'sinon';

const { run } = Ember;

let fakeInfowindowObject;
let component;

moduleForComponent('g-map-infowindow', 'Unit | Component | g map infowindow', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true,

  beforeEach() {
    fakeInfowindowObject = {
      setPosition: sinon.stub(),
      setOptions: sinon.stub(),
      open: sinon.stub(),
      close: sinon.stub(),
      addListener: sinon.stub()
    };
    sinon.stub(google.maps, 'InfoWindow').returns(fakeInfowindowObject);
    component = this.subject({
      mapContext: new GMapComponent()
    });
  },

  afterEach() {
    google.maps.InfoWindow.restore();
  }
});

test('it triggers `buildInfowindow` on `didInsertElement` event', function(assert) {
  component.setOptions = sinon.stub();
  component.buildInfowindow = sinon.stub().returns('infoWindowObject');
  component.trigger('didInsertElement');

  sinon.assert.calledOnce(component.buildInfowindow);
  assert.equal(component.get('infowindow'), 'infoWindowObject');
});

test('`buildInfowindow` isn\'t triggered if infowindow is already present in component', function() {
  component.buildInfowindow = sinon.stub();
  run(() => component.set('infowindow', fakeInfowindowObject));
  component.trigger('didInsertElement');

  sinon.assert.notCalled(component.buildInfowindow);
});

test('it triggers `setPosition` on `didInsertElement` event', function() {
  component.setPosition = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setPosition);
});

test('it triggers `setMap` on `didInsertElement` event', function() {
  component.setMap = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setMap);
});

test('it triggers `setMarker` on `didInsertElement` event', function() {
  component.setMarker = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setMarker);
});

test('it triggers `close` on `willDestroyElement` event', function() {
  component.close = sinon.stub();
  component.trigger('willDestroyElement');
  sinon.assert.calledOnce(component.close);
});

test('it triggers `unregisterInfowindow` on `willDestroyElement` event', function() {
  let mapContext;
  run(() => mapContext = component.get('mapContext'));
  run(() => component.set('hasMarker', true));

  mapContext.unregisterInfowindow = sinon.stub();
  component.trigger('willDestroyElement');

  sinon.assert.calledOnce(mapContext.unregisterInfowindow);
});

test('it constructs new `InfoWindow` object during `buildInfowindow`', function(assert) {
  let returnedInfowindow;
  run(() => returnedInfowindow = component.buildInfowindow());

  sinon.assert.calledOnce(google.maps.InfoWindow);
  assert.equal(returnedInfowindow, fakeInfowindowObject);
});

test('it triggers `attachCloseEvent` during `buildInfowindow` if onClose attr specified', function() {
  run(() => component.set('attrs', { onClose: 'action' }));

  component.attachCloseEvent = sinon.stub();
  run(() => component.buildInfowindow());

  sinon.assert.calledOnce(component.attachCloseEvent);
  sinon.assert.calledWith(component.attachCloseEvent, fakeInfowindowObject);
});

test('it doesn\'t triggers `attachCloseEvent` during `buildInfowindow` if onClose isn\'t specified', function() {
  run(() => component.set('attrs', { onClose: undefined }));

  component.attachCloseEvent = sinon.stub();
  run(() => component.buildInfowindow());

  sinon.assert.notCalled(component.attachCloseEvent);
});

test('it triggers `addListener` of InfoWindow during `attachCloseEvent`', function() {
  run(() => component.attachCloseEvent(fakeInfowindowObject));
  sinon.assert.calledOnce(fakeInfowindowObject.addListener);
  sinon.assert.calledWith(fakeInfowindowObject.addListener, 'closeclick');
});

test('it sends action `onClose` on callback for `closeclick` event', function() {
  fakeInfowindowObject.addListener.callsArg(1);
  component.sendAction = sinon.stub();

  run(() => component.set('attrs', { onClose: 'action' }));
  run(() => component.attachCloseEvent(fakeInfowindowObject));

  sinon.assert.calledOnce(component.sendAction);
  sinon.assert.calledWith(component.sendAction, 'onClose');
});

test('it runs closure action `attrs.onClose` directly on callback for `closeclick` event', function() {
  fakeInfowindowObject.addListener.callsArg(1);

  run(() => component.set('attrs', { onClose: sinon.stub() }));
  run(() => component.attachCloseEvent(fakeInfowindowObject));

  sinon.assert.calledOnce(component.attrs.onClose);
});

test('it triggers `close` of infowindow during `close` if infowindow is set', function() {
  fakeInfowindowObject.close = sinon.stub();

  run(() => component.set('infowindow', fakeInfowindowObject));
  run(() => component.close());

  sinon.assert.calledOnce(fakeInfowindowObject.close);
});

test('it doesn\'t trigger `close` of infowindow during `close` if there is no infowindow', function() {
  fakeInfowindowObject.close = sinon.stub();

  run(() => component.set('infowindow', undefined));
  run(() => component.close());

  sinon.assert.notCalled(fakeInfowindowObject.close);
});

test('it triggers `setMap` on `mapContext.map` change', function() {
  run(() => component.set('mapContext', { map: '' }));
  component.setMap = sinon.spy();
  run(() => component.set('mapContext.map', {}));
  sinon.assert.calledOnce(component.setMap);
});

test('it triggers `setMarker` on `mapContext.marker` change', function() {
  run(() => component.set('mapContext', { marker: '' }));
  component.setMarker = sinon.spy();
  run(() => component.set('mapContext.marker', {}));
  sinon.assert.calledOnce(component.setMarker);
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

test('it calls `setPosition` of InfoWindow on `setPosition` with lat/lng present', function() {
  const point = {};
  sinon.stub(google.maps, 'LatLng').returns(point);

  run(() => component.setProperties({
    lat: 10,
    lng: 100,
    infowindow: fakeInfowindowObject
  }));

  fakeInfowindowObject.setPosition = sinon.stub();

  run(() => component.setPosition());

  sinon.assert.calledOnce(fakeInfowindowObject.setPosition);
  sinon.assert.calledWith(fakeInfowindowObject.setPosition, point);

  google.maps.LatLng.restore();
});

test('it doesn\'t call `setPosition` of InfoWindow on `setPosition` when no lat present', function() {
  fakeInfowindowObject.setPosition = sinon.stub();

  run(() => component.setProperties({
    lng: 100,
    infowindow: fakeInfowindowObject
  }));
  run(() => component.setPosition());
  sinon.assert.notCalled(fakeInfowindowObject.setPosition);
});

test('it doesn\'t call `setPosition` of InfoWindow on `setPosition` when no lng present', function() {
  fakeInfowindowObject.setPosition = sinon.stub();

  run(() => component.setProperties({
    lat: 10,
    infowindow: fakeInfowindowObject
  }));
  run(() => component.setPosition());

  sinon.assert.notCalled(fakeInfowindowObject.setPosition);
});

test('it calls `open` of InfoWindow on `setMap` with `map` present', function() {
  const mapObject = {};
  run(() => component.setProperties({
    map: mapObject,
    hasMarker: false,
    infowindow: fakeInfowindowObject
  }));

  fakeInfowindowObject.open = sinon.stub();

  run(() => component.setMap());

  sinon.assert.calledOnce(fakeInfowindowObject.open);
  sinon.assert.calledWith(fakeInfowindowObject.open, mapObject);
});

test('it doesn\'t call `open` of InfoWindow on `setMap` when no `map` present', function() {
  fakeInfowindowObject.setMap = sinon.stub();
  run(() => component.setProperties({
    hasMarker: false,
    infowindow: fakeInfowindowObject
  }));
  run(() => component.setMap());
  sinon.assert.notCalled(fakeInfowindowObject.setMap);
});

test('it doesn\'t call `open` of InfoWindow on `setMap` when `hasMarker` is true', function() {
  fakeInfowindowObject.setMap = sinon.stub();
  const mapObject = {};
  run(() => component.setProperties({
    map: mapObject,
    hasMarker: true,
    infowindow: fakeInfowindowObject
  }));
  run(() => component.setMap());

  sinon.assert.notCalled(fakeInfowindowObject.setMap);
});

test(`it calls 'addListener' of google marker and 'registerInfowindow' of marker context
      on 'setMarker' with 'map' and 'marker' present`, function() {
  const mapObject = {};
  const fakeMarkerObject = { addListener: sinon.stub() };

  let mapContext;
  run(() => mapContext = component.get('mapContext'));
  mapContext.registerInfowindow = sinon.stub();

  run(() => component.setProperties({
    map: mapObject,
    marker: fakeMarkerObject,
    infowindow: fakeInfowindowObject
  }));

  mapContext.registerInfowindow = sinon.stub();
  fakeMarkerObject.addListener = sinon.stub().callsArg(1);
  fakeInfowindowObject.open = sinon.stub();
  run(() => component.setMarker());

  sinon.assert.calledOnce(mapContext.registerInfowindow);
  sinon.assert.calledWith(mapContext.registerInfowindow, component);

  sinon.assert.calledOnce(fakeMarkerObject.addListener);
  sinon.assert.calledWith(fakeMarkerObject.addListener, 'click');

  sinon.assert.calledOnce(fakeInfowindowObject.open);
  sinon.assert.calledWith(fakeInfowindowObject.open, mapObject, fakeMarkerObject);
});

test('it doesn\'t call `addListener` of google marker on `setMarker` when no `map` present', function() {
  const fakeMarkerObject = {
    addListener: sinon.stub()
  };

  run(() => component.setProperties({
    marker: fakeMarkerObject,
    infowindow: fakeInfowindowObject
  }));
  run(() => component.setMarker());

  sinon.assert.notCalled(fakeMarkerObject.addListener);
});
