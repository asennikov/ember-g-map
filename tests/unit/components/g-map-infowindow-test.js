import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';
import { moduleForComponent } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';
import sinon from 'sinon';

let fakeInfowindowObject, component;

moduleForComponent('g-map-infowindow', 'Unit | Component | g map infowindow', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true,
  needs: ['component:g-map'],

  beforeEach() {
    fakeInfowindowObject = {
      setPosition: sinon.stub(),
      setOptions: sinon.stub(),
      open: sinon.stub(),
      close: sinon.stub(),
      addListener: sinon.stub()
    };
    sinon.stub(google.maps, 'InfoWindow').returns(fakeInfowindowObject);

    const GMapComponent = getOwner(this).factoryFor('component:g-map');
    const mapContext = GMapComponent.create();
    mapContext.registerInfowindow = sinon.stub();
    mapContext.unregisterInfowindow = sinon.stub();

    component = this.subject({ mapContext });
  },

  afterEach() {
    google.maps.InfoWindow.restore();
  }
});

test('it triggers `buildInfowindow` on `didInsertElement` event', function(assert) {
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

test('it triggers `setOptions` on `didInsertElement` event', function() {
  component.setOptions = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setOptions);
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
  component.close = sinon.stub();
  component.trigger('willDestroyElement');

  sinon.assert.calledOnce(mapContext.unregisterInfowindow);
});

test('it constructs new `InfoWindow` object during `buildInfowindow`', function(assert) {
  let returnedInfowindow;
  run(() => returnedInfowindow = component.buildInfowindow());

  sinon.assert.calledOnce(google.maps.InfoWindow);
  assert.equal(returnedInfowindow, fakeInfowindowObject);
});

test('it triggers `addListener` of infowindow during `buildInfowindow` if onOpen attr specified', function() {
  run(() => component.set('attrs', { onOpen: 'action' }));
  run(() => component.buildInfowindow());

  sinon.assert.calledOnce(fakeInfowindowObject.addListener);
  sinon.assert.calledWith(fakeInfowindowObject.addListener, 'domready');
});

test('it triggers `addListener` of infowindow during `buildInfowindow` if onClose attr specified', function() {
  run(() => component.set('attrs', { onClose: 'action' }));
  run(() => component.buildInfowindow());

  sinon.assert.calledOnce(fakeInfowindowObject.addListener);
  sinon.assert.calledWith(fakeInfowindowObject.addListener, 'closeclick');
});

test('it doesn\'t trigger `addListener` during `buildInfowindow` if onOpen isn\'t specified', function() {
  run(() => component.set('attrs', { onOpen: undefined }));
  run(() => component.buildInfowindow());
  sinon.assert.notCalled(fakeInfowindowObject.addListener);
});

test('it doesn\'t trigger `addListener` during `buildInfowindow` if onClose isn\'t specified', function() {
  run(() => component.set('attrs', { onClose: undefined }));
  run(() => component.buildInfowindow());
  sinon.assert.notCalled(fakeInfowindowObject.addListener);
});

test('it triggers `handleOpenClickEvent` on callback for `domready` event', function() {
  fakeInfowindowObject.addListener.callsArg(1);
  component.handleOpenClickEvent = sinon.stub();

  run(() => component.set('attrs', { onOpen: 'action' }));
  run(() => component.buildInfowindow());

  sinon.assert.calledOnce(component.handleOpenClickEvent);
});

test('it triggers `handleCloseClickEvent` on callback for `closeclick` event', function() {
  fakeInfowindowObject.addListener.callsArg(1);
  component.handleCloseClickEvent = sinon.stub();

  run(() => component.set('attrs', { onClose: 'action' }));
  run(() => component.buildInfowindow());

  sinon.assert.calledOnce(component.handleCloseClickEvent);
});

test('it sends action `onOpen` on `handleOpenClickEvent`', function() {
  component.sendAction = sinon.stub();

  run(() => component.set('attrs', { onOpen: 'action' }));
  run(() => component.handleOpenClickEvent());

  sinon.assert.calledOnce(component.sendAction);
  sinon.assert.calledWith(component.sendAction, 'onOpen');
});

test('it sends action `onClose` on `handleCloseClickEvent`', function() {
  component.sendAction = sinon.stub();

  run(() => component.set('attrs', { onClose: 'action' }));
  run(() => component.handleCloseClickEvent());

  sinon.assert.calledOnce(component.sendAction);
  sinon.assert.calledWith(component.sendAction, 'onClose');
});

test('it runs closure action `attrs.onOpen` directly on `handleOpenClickEvent`', function() {
  run(() => component.set('attrs', { onOpen: sinon.stub() }));
  run(() => component.handleOpenClickEvent());

  sinon.assert.calledOnce(component.attrs.onOpen);
});

test('it runs closure action `attrs.onClose` directly on `handleCloseClickEvent`', function() {
  run(() => component.set('attrs', { onClose: sinon.stub() }));
  run(() => component.handleCloseClickEvent());

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

test('it triggers `setOptions` on `disableAutoPan` change', function() {
  component.setOptions = sinon.spy();
  run(() => component.set('disableAutoPan', true));
  sinon.assert.calledOnce(component.setOptions);
});

test('it triggers `setOptions` on `maxWidth` change', function() {
  component.setOptions = sinon.spy();
  run(() => component.set('maxWidth', 200));
  sinon.assert.calledOnce(component.setOptions);
});

test('it triggers `setOptions` on `pixelOffset` change', function() {
  component.setOptions = sinon.spy();
  run(() => component.set('pixelOffset', { width: 10, height: 10 }));
  sinon.assert.calledOnce(component.setOptions);
});

test('it doesn\'t call `setOptions` of InfoWindow on `setOptions` when no option present', function() {
  fakeInfowindowObject.setOptions = sinon.stub();

  run(() => component.setProperties({
    infowindow: fakeInfowindowObject
  }));
  run(() => component.setOptions());
  sinon.assert.notCalled(fakeInfowindowObject.setOptions);
});

test('it calls `setOptions` of InfoWindow on `setOptions` with `disableAutoPan` present', function() {
  fakeInfowindowObject.setOptions = sinon.stub();

  run(() => component.setProperties({
    disableAutoPan: true,
    infowindow: fakeInfowindowObject
  }));
  sinon.assert.calledOnce(fakeInfowindowObject.setOptions);
});

test('it calls `setOptions` of InfoWindow on `setOptions` with `maxWidth` present', function() {
  fakeInfowindowObject.setOptions = sinon.stub();

  run(() => component.setProperties({
    maxWidth: 200,
    infowindow: fakeInfowindowObject
  }));
  sinon.assert.calledOnce(fakeInfowindowObject.setOptions);
});

test('it calls `setOptions` of InfoWindow on `setOptions` with `pixelOffset` present', function() {
  fakeInfowindowObject.setOptions = sinon.stub();

  run(() => component.setProperties({
    pixelOffset: { width: 10, height: 10 },
    infowindow: fakeInfowindowObject
  }));
  sinon.assert.calledOnce(fakeInfowindowObject.setOptions);
});

test('it calls `setOptions` of InfoWindow on `setOptions` once with more than one option present', function() {
  fakeInfowindowObject.setOptions = sinon.stub();

  run(() => component.setProperties({
    disableAutoPan: true,
    maxWidth: 200,
    infowindow: fakeInfowindowObject
  }));
  sinon.assert.calledOnce(fakeInfowindowObject.setOptions);
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

test('it calls `open` on `setMap` when `hasMarker` is false', function() {
  run(() => component.set('hasMarker', false));

  component.open = sinon.stub();
  run(() => component.setMap());

  sinon.assert.calledOnce(component.open);
});

test('it doesn\'t call `open` on `setMap` when `hasMarker` is true', function() {
  run(() => component.set('hasMarker', true));

  component.open = sinon.stub();
  run(() => component.setMap());

  sinon.assert.notCalled(component.open);
});

test('it calls `open` of InfoWindow on `open` with single arg when only `map` is present', function() {
  const mapObject = {};
  run(() => component.setProperties({
    map: mapObject,
    marker: undefined,
    infowindow: fakeInfowindowObject
  }));

  fakeInfowindowObject.open = sinon.stub();
  run(() => component.open());

  sinon.assert.calledOnce(fakeInfowindowObject.open);
  sinon.assert.calledWith(fakeInfowindowObject.open, mapObject);
});

test('it calls `open` of InfoWindow on `open` with 2 args when `map` and `marker` are present', function() {
  const mapObject = { mapParam: 'value' };
  const markerObject = { markerParam: 'value' };
  run(() => component.setProperties({
    map: mapObject,
    marker: markerObject,
    infowindow: fakeInfowindowObject
  }));

  fakeInfowindowObject.open = sinon.stub();
  run(() => component.open());

  sinon.assert.calledOnce(fakeInfowindowObject.open);
  sinon.assert.calledWith(fakeInfowindowObject.open, mapObject, markerObject);
});

test('it doesn\'t call `open` of InfoWindow on `open` when no `map` present', function() {
  fakeInfowindowObject.setMap = sinon.stub();
  run(() => component.setProperties({
    map: undefined,
    infowindow: fakeInfowindowObject
  }));
  run(() => component.open());
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

test(`it calls 'retrieveOpenEvent', 'retrieveCloseEvent' and 'registerInfowindow' of marker context
      on 'setMarker' with 'map' and 'marker' present`, function() {
  const mapObject = {};
  const markerObject = {};

  let mapContext;
  run(() => mapContext = component.get('mapContext'));
  run(() => component.setProperties({
    map: mapObject,
    marker: markerObject,
    infowindow: fakeInfowindowObject
  }));

  component.retrieveOpenEvent = sinon.stub().returns('open');
  component.retrieveCloseEvent = sinon.stub().returns('close');
  mapContext.registerInfowindow = sinon.stub();
  run(() => component.setMarker());

  sinon.assert.calledOnce(component.retrieveOpenEvent);
  sinon.assert.calledOnce(component.retrieveCloseEvent);

  sinon.assert.calledOnce(mapContext.registerInfowindow);
  sinon.assert.calledWith(mapContext.registerInfowindow, component, 'open', 'close');
});

test('`retrieveOpenEvent` returns `openOn` event if it\'s whitelisted in const', function(assert) {
  let resultingEvent;
  run(() => component.set('openOn', 'click'));
  run(() => resultingEvent = component.retrieveOpenEvent());
  assert.equal(resultingEvent, 'click');

  run(() => component.set('openOn', 'dblclick'));
  run(() => resultingEvent = component.retrieveOpenEvent());
  assert.equal(resultingEvent, 'dblclick');

  run(() => component.set('openOn', 'rightclick'));
  run(() => resultingEvent = component.retrieveOpenEvent());
  assert.equal(resultingEvent, 'rightclick');

  run(() => component.set('openOn', 'mouseover'));
  run(() => resultingEvent = component.retrieveOpenEvent());
  assert.equal(resultingEvent, 'mouseover');

  run(() => component.set('openOn', 'mouseout'));
  run(() => resultingEvent = component.retrieveOpenEvent());
  assert.equal(resultingEvent, 'mouseout');
});

test('`retrieveCloseEvent` returns `closeOn` event if it\'s whitelisted in const', function(assert) {
  let resultingEvent;
  run(() => component.set('closeOn', 'click'));
  run(() => resultingEvent = component.retrieveCloseEvent());
  assert.equal(resultingEvent, 'click');

  run(() => component.set('closeOn', 'dblclick'));
  run(() => resultingEvent = component.retrieveCloseEvent());
  assert.equal(resultingEvent, 'dblclick');

  run(() => component.set('closeOn', 'rightclick'));
  run(() => resultingEvent = component.retrieveCloseEvent());
  assert.equal(resultingEvent, 'rightclick');

  run(() => component.set('closeOn', 'mouseover'));
  run(() => resultingEvent = component.retrieveCloseEvent());
  assert.equal(resultingEvent, 'mouseover');

  run(() => component.set('closeOn', 'mouseout'));
  run(() => resultingEvent = component.retrieveCloseEvent());
  assert.equal(resultingEvent, 'mouseout');
});

test('`retrieveOpenEvent` returns `click` event if `openOn` isn\'t whitelisted in const', function(assert) {
  let resultingEvent;
  run(() => component.set('openOn', 'wrong-event'));
  run(() => resultingEvent = component.retrieveOpenEvent());
  assert.equal(resultingEvent, 'click');
});

test('`retrieveCloseEvent` returns `null` event if `closeOn` isn\'t whitelisted in const', function(assert) {
  let resultingEvent;
  run(() => component.set('closeOn', 'wrong-event'));
  run(() => resultingEvent = component.retrieveCloseEvent());
  assert.equal(resultingEvent, null);
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
