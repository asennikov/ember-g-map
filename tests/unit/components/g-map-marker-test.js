import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';
import { moduleForComponent } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';
import sinon from 'sinon';

let fakeMarkerObject, component;

moduleForComponent('g-map-marker', 'Unit | Component | g map marker', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true,
  needs: ['component:g-map'],

  beforeEach() {
    fakeMarkerObject = {
      setPosition: sinon.stub(),
      setIcon: sinon.stub(),
      setLabel: sinon.stub(),
      setTitle: sinon.stub(),
      setMap: sinon.stub(),
      setZIndex: sinon.stub(),
      setDraggable: sinon.stub(),
      addListener: sinon.stub()
    };
    sinon.stub(google.maps, 'Marker').returns(fakeMarkerObject);
    const GMapComponent = getOwner(this).factoryFor('component:g-map');
    component = this.subject({
      mapContext: GMapComponent.create()
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

test('it triggers `setOnClick` on `didInsertElement` event', function() {
  component.setOnClick = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setOnClick);
});

test('it triggers `setOnDrag` on `didInsertElement` event', function() {
  component.setOnDrag = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setOnDrag);
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

test('it sets `infowindow` and triggers `attachOpenCloseEvents` on `registerInfowindow`', function(assert) {
  component.attachOpenCloseEvents = sinon.spy();

  const infowindowObject = { infowindowProperty: 'value' };
  run(() => component.registerInfowindow(infowindowObject, 'openEvent', 'closeEvent'));

  assert.equal(component.get('infowindow'), infowindowObject);
  sinon.assert.calledOnce(component.attachOpenCloseEvents);
  sinon.assert.calledWith(component.attachOpenCloseEvents, infowindowObject, 'openEvent', 'closeEvent');
});

test('it unsets `infowindow` on `unregisterInfowindow`', function(assert) {
  const infowindowObject = { infowindowProperty: 'value' };
  run(() => component.set('infowindow', infowindowObject));
  run(() => component.unregisterInfowindow());

  assert.equal(component.get('infowindow'), null);
});

test(`it calls 'attachTogglingInfowindowEvent' on 'attachOpenCloseEvents'
      if 'openEvent' and 'closeEvent' are equal`, function() {
  component.attachTogglingInfowindowEvent = sinon.spy();

  const infowindowObject = { infowindowProperty: 'value' };
  run(() => component.set('marker', fakeMarkerObject));
  run(() => component.attachOpenCloseEvents(infowindowObject, 'event', 'event'));

  sinon.assert.calledOnce(component.attachTogglingInfowindowEvent);
  sinon.assert.calledWith(component.attachTogglingInfowindowEvent,
    fakeMarkerObject, infowindowObject, 'event');
});

test(`it calls 'attachOpenInfowindowEvent' and 'attachCloseInfowindowEvent' on 'attachOpenCloseEvents'
      if 'openEvent' and 'closeEvent' are not equal`, function() {
  component.attachOpenInfowindowEvent = sinon.spy();
  component.attachCloseInfowindowEvent = sinon.spy();

  const infowindowObject = { infowindowProperty: 'value' };
  run(() => component.set('marker', fakeMarkerObject));
  run(() => component.attachOpenCloseEvents(infowindowObject, 'openEvent', 'closeEvent'));

  sinon.assert.calledOnce(component.attachOpenInfowindowEvent);
  sinon.assert.calledWith(component.attachOpenInfowindowEvent,
    fakeMarkerObject, infowindowObject, 'openEvent');

  sinon.assert.calledOnce(component.attachCloseInfowindowEvent);
  sinon.assert.calledWith(component.attachCloseInfowindowEvent,
    fakeMarkerObject, infowindowObject, 'closeEvent');
});

test('it calls `addListener` of google marker on `attachTogglingInfowindowEvent` with `event` present', function() {
  const infowindowObject = { infowindowProperty: 'value' };

  run(() => component.set('marker', fakeMarkerObject));
  run(() => component.attachTogglingInfowindowEvent(
    fakeMarkerObject, infowindowObject, 'event-name'));

  sinon.assert.calledOnce(fakeMarkerObject.addListener);
  sinon.assert.calledWith(fakeMarkerObject.addListener, 'event-name');
});

test('it doesn\'t call `addListener` of google marker on `attachTogglingInfowindowEvent` when no `event` present', function() {
  const infowindowObject = EmberObject.create({ infowindowProperty: 'value' });

  run(() => component.set('marker', fakeMarkerObject));
  run(() => component.attachTogglingInfowindowEvent(
    fakeMarkerObject, infowindowObject, null));

  sinon.assert.notCalled(fakeMarkerObject.addListener);
});

test('it calls `open` of infowindow on event attached during `attachTogglingInfowindowEvent` if `isOpen` is false', function() {
  const infowindowObject = EmberObject.create({
    open: sinon.stub(),
    isOpen: false
  });
  fakeMarkerObject.addListener = sinon.stub().callsArg(1);

  run(() => component.set('marker', fakeMarkerObject));
  run(() => component.attachTogglingInfowindowEvent(
    fakeMarkerObject, infowindowObject, 'event-name'));

  sinon.assert.calledOnce(infowindowObject.open);
});

test('it calls `close` of infowindow on event attached during `attachTogglingInfowindowEvent` if `isOpen` is true', function() {
  const infowindowObject = EmberObject.create({
    close: sinon.stub(),
    isOpen: true
  });
  fakeMarkerObject.addListener = sinon.stub().callsArg(1);

  run(() => component.set('marker', fakeMarkerObject));
  run(() => component.attachTogglingInfowindowEvent(
    fakeMarkerObject, infowindowObject, 'event-name'));

  sinon.assert.calledOnce(infowindowObject.close);
});

test('it calls `addListener` of google marker on `attachOpenInfowindowEvent` with `event` present', function() {
  const infowindowObject = { infowindowProperty: 'value' };

  run(() => component.set('marker', fakeMarkerObject));
  run(() => component.attachOpenInfowindowEvent(
    fakeMarkerObject, infowindowObject, 'event-name'));

  sinon.assert.calledOnce(fakeMarkerObject.addListener);
  sinon.assert.calledWith(fakeMarkerObject.addListener, 'event-name');
});

test('it doesn\'t call `addListener` of google marker on `attachOpenInfowindowEvent` when no `event` present', function() {
  const infowindowObject = { infowindowProperty: 'value' };

  run(() => component.set('marker', fakeMarkerObject));
  run(() => component.attachOpenInfowindowEvent(
    fakeMarkerObject, infowindowObject, null));

  sinon.assert.notCalled(fakeMarkerObject.addListener);
});

test('it calls `open` of infowindow on event attached during `attachOpenInfowindowEvent`', function() {
  const infowindowObject = {
    open: sinon.stub()
  };
  fakeMarkerObject.addListener = sinon.stub().callsArg(1);

  run(() => component.set('marker', fakeMarkerObject));
  run(() => component.attachOpenInfowindowEvent(
    fakeMarkerObject, infowindowObject, 'event-name'));

  sinon.assert.calledOnce(infowindowObject.open);
});

test('it calls `addListener` of google marker on `attachCloseInfowindowEvent` with `event` present', function() {
  const infowindowObject = { infowindowProperty: 'value' };

  run(() => component.set('marker', fakeMarkerObject));
  run(() => component.attachCloseInfowindowEvent(
    fakeMarkerObject, infowindowObject, 'event-name'));

  sinon.assert.calledOnce(fakeMarkerObject.addListener);
  sinon.assert.calledWith(fakeMarkerObject.addListener, 'event-name');
});

test('it doesn\'t call `addListener` of google marker on `attachCloseInfowindowEvent` when no `event` present', function() {
  const infowindowObject = { infowindowProperty: 'value' };

  run(() => component.set('marker', fakeMarkerObject));
  run(() => component.attachCloseInfowindowEvent(
    fakeMarkerObject, infowindowObject, null));

  sinon.assert.notCalled(fakeMarkerObject.addListener);
});

test('it calls `close` of infowindow on event attached during `attachCloseInfowindowEvent`', function() {
  const infowindowObject = {
    close: sinon.stub()
  };
  fakeMarkerObject.addListener = sinon.stub().callsArg(1);

  run(() => component.set('marker', fakeMarkerObject));
  run(() => component.attachCloseInfowindowEvent(
    fakeMarkerObject, infowindowObject, 'event-name'));

  sinon.assert.calledOnce(infowindowObject.close);
});

test('it triggers `setMap` on `mapContext.map` change', function() {
  run(() => component.set('mapContext', { map: '' }));
  component.setMap = sinon.spy();
  run(() => component.set('mapContext.map', {}));
  sinon.assert.calledOnce(component.setMap);
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

test('it triggers `setLabel` on `didInsertElement` event', function() {
  component.setLabel = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setLabel);
});

test('it triggers `setLabel` on `label` change', function() {
  component.setLabel = sinon.stub();
  run(() => component.set('label', 'A'));
  sinon.assert.calledOnce(component.setLabel);
});

test('it calls `setLabel` of google marker on `setLabel` with label present', function() {
  run(() => component.setProperties({
    label: 'A',
    marker: fakeMarkerObject
  }));

  fakeMarkerObject.setLabel = sinon.stub();

  run(() => component.setLabel());

  sinon.assert.calledOnce(fakeMarkerObject.setLabel);
  sinon.assert.calledWith(fakeMarkerObject.setLabel, 'A');
});

test('it doesn\'t call `setLabel` of google marker on `setLabel` when no label present', function() {
  fakeMarkerObject.setLabel = sinon.stub();

  run(() => component.setProperties({
    label: undefined,
    marker: fakeMarkerObject
  }));
  run(() => component.setLabel());

  sinon.assert.notCalled(fakeMarkerObject.setLabel);
});

test('it triggers `setZIndex` on `didInsertElement` event', function() {
  component.setZIndex = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setZIndex);
});

test('it triggers `setZIndex` on `zIndex` change', function() {
  component.setZIndex = sinon.stub();
  run(() => component.set('zIndex', 11));
  sinon.assert.calledOnce(component.setZIndex);
});

test('it calls `setZIndex` of google marker on `setZIndex` with zIndex present', function() {
  run(() => component.setProperties({
    zIndex: 10,
    marker: fakeMarkerObject
  }));

  fakeMarkerObject.setZIndex = sinon.stub();

  run(() => component.setZIndex());

  sinon.assert.calledOnce(fakeMarkerObject.setZIndex);
  sinon.assert.calledWith(fakeMarkerObject.setZIndex, 10);
});

test('it doesn\'t call `setZIndex` of google marker on `setZIndex` when no zIndex present', function() {
  fakeMarkerObject.setZIndex = sinon.stub();

  run(() => component.setProperties({
    zIndex: undefined,
    marker: fakeMarkerObject
  }));
  run(() => component.setZIndex());

  sinon.assert.notCalled(fakeMarkerObject.setZIndex);
});

test('it triggers `setDraggable` on `didInsertElement` event', function() {
  component.setDraggable = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setDraggable);
});

test('it triggers `setDraggable` on `draggable` change', function() {
  component.setDraggable = sinon.stub();
  run(() => component.set('draggable', false));
  sinon.assert.calledOnce(component.setDraggable);
});

test('it calls `setDraggable` of google marker on `setDraggable` with draggable present', function() {
  run(() => component.setProperties({
    draggable: true,
    marker: fakeMarkerObject
  }));

  fakeMarkerObject.setDraggable = sinon.stub();

  run(() => component.setDraggable());

  sinon.assert.calledOnce(fakeMarkerObject.setDraggable);
  sinon.assert.calledWith(fakeMarkerObject.setDraggable, true);
});

test('it doesn\'t call `setDraggable` of google marker on `setDraggable` when no draggable present', function() {
  fakeMarkerObject.setDraggable = sinon.stub();

  run(() => component.setProperties({
    draggable: undefined,
    marker: fakeMarkerObject
  }));
  run(() => component.setDraggable());

  sinon.assert.notCalled(fakeMarkerObject.setDraggable);
});

test('it triggers `setTitle` on `didInsertElement` event', function() {
  component.setTitle = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setTitle);
});

test('it triggers `setTitle` on `title` change', function() {
  component.setTitle = sinon.stub();
  run(() => component.set('title', 'marker-title'));
  sinon.assert.calledOnce(component.setTitle);
});

test('it calls `setTitle` of google marker on `setTitle` with title present', function() {
  run(() => component.setProperties({
    title: 'Marker #13',
    marker: fakeMarkerObject
  }));

  fakeMarkerObject.setTitle = sinon.stub();

  run(() => component.setTitle());

  sinon.assert.calledOnce(fakeMarkerObject.setTitle);
  sinon.assert.calledWith(fakeMarkerObject.setTitle, 'Marker #13');
});

test('it doesn\'t call `setTitle` of google marker on `setTitle` when no title present', function() {
  fakeMarkerObject.setTitle = sinon.stub();

  run(() => component.setProperties({
    title: undefined,
    marker: fakeMarkerObject
  }));
  run(() => component.setTitle());

  sinon.assert.notCalled(fakeMarkerObject.setTitle);
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

test('it calls `addListener` of google marker on `setOnClick` with `marker` present', function() {
  fakeMarkerObject.addListener = sinon.stub().callsArg(1);
  run(() => component.set('marker', fakeMarkerObject));
  component.sendOnClick = sinon.stub();

  run(() => component.setOnClick());

  sinon.assert.calledOnce(fakeMarkerObject.addListener);
  sinon.assert.calledWith(fakeMarkerObject.addListener, 'click');

  sinon.assert.calledOnce(component.sendOnClick);
});

test('it sends action `onClick` on callback for `click` event', function() {
  component.sendAction = sinon.stub();

  run(() => component.set('attrs', { onClick: 'action' }));
  run(() => component.sendOnClick());

  sinon.assert.calledOnce(component.sendAction);
  sinon.assert.calledWith(component.sendAction, 'onClick');
});

test('it runs closure action `attrs.onClick` directly on callback for `click` event', function() {
  run(() => component.set('attrs', { onClick: sinon.stub() }));
  run(() => component.sendOnClick());

  sinon.assert.calledOnce(component.attrs.onClick);
});

test('it calls `groupMarkerClicked` of map context on `sendOnClick` with `group` present', function() {
  let mapContext;
  run(() => mapContext = component.get('mapContext'));
  mapContext.groupMarkerClicked = sinon.stub();

  run(() => component.setProperties({
    group: 'cats',
    attrs: {}
  }));
  run(() => component.sendOnClick());

  sinon.assert.calledOnce(mapContext.groupMarkerClicked);
  sinon.assert.calledWith(mapContext.groupMarkerClicked, component, 'cats');
});

test('it doesn\'t call `groupMarkerClicked` of google marker on `sendOnClick` when no `group` present', function() {
  let mapContext;
  run(() => mapContext = component.get('mapContext'));
  mapContext.groupMarkerClicked = sinon.stub();

  run(() => component.set('attrs', {}));
  run(() => component.sendOnClick());
  sinon.assert.notCalled(mapContext.groupMarkerClicked);
});

test('it calls `addListener` of google marker on `setOnDrag` with `marker` present', function() {
  const fakeDragEvent = {
    latLng: {
      lat: () => 101,
      lng: () => 11
    }
  };
  fakeMarkerObject.addListener = sinon.stub().callsArgWith(1, fakeDragEvent);
  run(() => component.set('marker', fakeMarkerObject));
  component.sendOnDrag = sinon.stub();

  run(() => component.setOnDrag());

  sinon.assert.calledOnce(fakeMarkerObject.addListener);
  sinon.assert.calledWith(fakeMarkerObject.addListener, 'dragend');

  sinon.assert.calledOnce(component.sendOnDrag);
  sinon.assert.calledWith(component.sendOnDrag, 101, 11);
});

test('it sends action `onDrag` on callback for `dragend` event', function() {
  component.sendAction = sinon.stub();

  run(() => component.set('attrs', { onDrag: 'action' }));
  run(() => component.sendOnDrag(66, 77));

  sinon.assert.calledOnce(component.sendAction);
  sinon.assert.calledWith(component.sendAction, 'onDrag', 66, 77);
});

test('it runs closure action `attrs.onDrag` directly on callback for `dragend` event', function() {
  run(() => component.set('attrs', { onDrag: sinon.stub() }));
  run(() => component.sendOnDrag(111, 55));

  sinon.assert.calledOnce(component.attrs.onDrag);
  sinon.assert.calledWith(component.attrs.onDrag, 111, 55);
});

test('it calls `close` of infowindow on `closeInfowindow`', function() {
  const infowindow = { close: sinon.stub() };
  run(() => component.set('infowindow', infowindow));

  run(() => component.closeInfowindow());
  sinon.assert.calledOnce(infowindow.close);
});
