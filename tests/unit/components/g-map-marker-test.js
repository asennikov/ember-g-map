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
      setLabel: sinon.stub(),
      setTitle: sinon.stub(),
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

test('it triggers `setOnClick` on `didInsertElement` event', function() {
  component.setOnClick = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setOnClick);
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

test('it doesn\'t call `setLabel` of google marker on `setLabel` when no label present', function() {
  fakeMarkerObject.setLabel = sinon.stub();

  run(() => component.setProperties({
    label: undefined,
    marker: fakeMarkerObject
  }));
  run(() => component.setLabel());

  sinon.assert.notCalled(fakeMarkerObject.setLabel);
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

test('it calls `close` of infowindow on `closeInfowindow`', function() {
  const infowindow = { close: sinon.stub() };
  run(() => component.set('infowindow', infowindow));

  run(() => component.closeInfowindow());
  sinon.assert.calledOnce(infowindow.close);
});
