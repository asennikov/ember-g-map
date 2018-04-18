import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';
import { moduleForComponent } from 'ember-qunit';
import test from 'ember-sinon-qunit/test-support/test';
import sinon from 'sinon';

let fakePolylineObject, component;

moduleForComponent('g-map-polyline', 'Unit | Component | g map polyline', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true,
  needs: ['component:g-map'],

  beforeEach() {
    fakePolylineObject = {
      setPath: sinon.stub(),
      setMap: sinon.stub(),
      setOptions: sinon.stub(),
      addListener: sinon.stub()
    };
    sinon.stub(google.maps, 'Polyline').returns(fakePolylineObject);
    const GMapComponent = getOwner(this).factoryFor('component:g-map');
    component = this.subject({
      mapContext: GMapComponent.create()
    });
  },

  afterEach() {
    google.maps.Polyline.restore();
  }
});

test('it constructs new `Polyline` object on `didInsertElement` event', function(assert) {
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(google.maps.Polyline);
  assert.equal(component.get('polyline'), fakePolylineObject);
});

test('new `Polyline` isn\'t constructed if it already present in component', function() {
  run(() => component.set('polyline', fakePolylineObject));
  component.trigger('didInsertElement');
  sinon.assert.notCalled(google.maps.Polyline);
});

test('it triggers `setMap` on `didInsertElement` event', function() {
  component.setMap = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setMap);
});

test('it triggers `updatePolylineOptions` on `didInsertElement` event', function() {
  component.updatePolylineOptions = sinon.spy();

  run(() => component.set('map', {}));
  component.trigger('didInsertElement');

  sinon.assert.calledOnce(component.updatePolylineOptions);
});

test('it triggers `updatePolylineOptions` on `strokeColor` change', function() {
  component.updatePolylineOptions = sinon.spy();
  run(() => component.set('strokeColor', '#000000'));
  sinon.assert.calledOnce(component.updatePolylineOptions);
});

test('it triggers `updatePolylineOptions` on `strokeWeight` change', function() {
  component.updatePolylineOptions = sinon.spy();
  run(() => component.set('strokeWeight', 5));
  sinon.assert.calledOnce(component.updatePolylineOptions);
});

test('it triggers `updatePolylineOptions` on `strokeOpacity` change', function() {
  component.updatePolylineOptions = sinon.spy();
  run(() => component.set('strokeOpacity', 0.1));
  sinon.assert.calledOnce(component.updatePolylineOptions);
});

test('it triggers `updatePolylineOptions` on `zIndex` change', function() {
  component.updatePolylineOptions = sinon.spy();
  run(() => component.set('zIndex', 2));
  sinon.assert.calledOnce(component.updatePolylineOptions);
});

test('it triggers `updatePolylineOptions` only once on several option changes', function() {
  component.updatePolylineOptions = sinon.spy();
  run(() => component.setProperties({
    strokeWeight: 2,
    strokeOpacity: 0.5,
    zIndex: 4
  }));
  sinon.assert.calledOnce(component.updatePolylineOptions);
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

test('it triggers `unsetPolylineFromMap` on `willDestroyElement` event', function() {
  component.unsetPolylineFromMap = sinon.stub();
  component.trigger('willDestroyElement');
  sinon.assert.calledOnce(component.unsetPolylineFromMap);
});

test('it triggers `setMap` of polyline with null during `unsetPolylineFromMap` if polyline is set', function() {
  fakePolylineObject.setMap = sinon.stub();

  run(() => component.set('polyline', fakePolylineObject));
  run(() => component.unsetPolylineFromMap());

  sinon.assert.calledOnce(fakePolylineObject.setMap);
  sinon.assert.calledWith(fakePolylineObject.setMap, null);
});

test('it doesn\'t trigger `setMap` of polyline during `unsetPolylineFromMap` if there is no polyline', function() {
  fakePolylineObject.setMap = sinon.stub();

  run(() => component.set('polyline', undefined));
  run(() => component.unsetPolylineFromMap());

  sinon.assert.notCalled(fakePolylineObject.setMap);
});

test('it triggers `setMap` on `mapContext.map` change', function() {
  run(() => component.set('mapContext', { map: '' }));
  component.setMap = sinon.spy();
  run(() => component.set('mapContext.map', {}));
  sinon.assert.calledOnce(component.setMap);
});

test('it triggers `setPath` on `didInsertElement` event', function() {
  component.setPath = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setPath);
});

test('it calls `setMap` of google polyline on `setMap` with `map` present', function() {
  const mapObject = {};
  run(() => component.setProperties({
    map: mapObject,
    polyline: fakePolylineObject
  }));

  fakePolylineObject.setMap = sinon.stub();

  run(() => component.setMap());

  sinon.assert.calledOnce(fakePolylineObject.setMap);
  sinon.assert.calledWith(fakePolylineObject.setMap, mapObject);
});

test('it doesn\'t call `setMap` of google polyline on `setMap` when no `map` present', function() {
  fakePolylineObject.setMap = sinon.stub();
  run(() => component.setMap());
  sinon.assert.notCalled(fakePolylineObject.setMap);
});

test('it calls `setOptions` of google polyline on `updatePolylineOptions`', function() {
  const polylineOptions = {
    strokeColor: '#ffffff',
    strokeWeight: 2,
    strokeOpacity: 1,
    zIndex: 1
  };
  run(() => component.setProperties(polylineOptions));
  run(() => component.set('polyline', fakePolylineObject));

  run(() => component.updatePolylineOptions());

  sinon.assert.calledOnce(fakePolylineObject.setOptions);
  sinon.assert.calledWith(fakePolylineObject.setOptions, polylineOptions);
});

test('it doesn\'t call `setOptions` of google polyline on `updatePolylineOptions` if no options are provided', function() {
  run(() => component.set('polyline', fakePolylineObject));
  run(() => component.updatePolylineOptions());
  sinon.assert.notCalled(fakePolylineObject.setOptions);
});

test('it registers itself in parent\'s `polylines` array on `init` event', function() {
  let mapContext;
  run(() => mapContext = component.get('mapContext'));
  mapContext.registerPolyline = sinon.stub();

  component.trigger('init');

  sinon.assert.calledOnce(mapContext.registerPolyline);
  sinon.assert.calledWith(mapContext.registerPolyline, component);
});

test('it unregisters itself in parent\'s `polylines` array on `willDestroyElement` event', function() {
  let mapContext;
  run(() => mapContext = component.get('mapContext'));
  mapContext.unregisterPolyline = sinon.stub();

  component.trigger('willDestroyElement');

  sinon.assert.calledOnce(mapContext.unregisterPolyline);
  sinon.assert.calledWith(mapContext.unregisterPolyline, component);
});

test('it calls `addListener` of google polyline on `setOnClick` with `polyline` present', function() {
  const fakeEventObject = { name: 'click' };
  fakePolylineObject.addListener = sinon.stub().callsArgWith(1, fakeEventObject);
  run(() => component.set('polyline', fakePolylineObject));
  component.sendOnClick = sinon.stub();

  run(() => component.setOnClick());

  sinon.assert.calledOnce(fakePolylineObject.addListener);
  sinon.assert.calledWith(fakePolylineObject.addListener, 'click');

  sinon.assert.calledOnce(component.sendOnClick);
  sinon.assert.calledWith(component.sendOnClick, fakeEventObject);
});

test('it sends action `onClick` on callback for `click` event', function() {
  const fakeEventObject = { name: 'click' };
  component.sendAction = sinon.stub();

  run(() => component.set('attrs', { onClick: 'action' }));
  run(() => component.set('polyline', fakePolylineObject));
  run(() => component.sendOnClick(fakeEventObject));

  sinon.assert.calledOnce(component.sendAction);
  sinon.assert.calledWith(component.sendAction, 'onClick', fakeEventObject, fakePolylineObject);
});

test('it runs closure action `attrs.onClick` directly on callback for `click` event', function() {
  const fakeEventObject = { name: 'click' };
  run(() => component.set('attrs', { onClick: sinon.stub() }));
  run(() => component.set('polyline', fakePolylineObject));
  run(() => component.sendOnClick(fakeEventObject));

  sinon.assert.calledOnce(component.attrs.onClick);
  sinon.assert.calledWith(component.attrs.onClick, fakeEventObject, fakePolylineObject);
});

test('it calls `addListener` of google polyline on `setOnDrag` with `polyline` present', function() {
  const fakeEventObject = { name: 'dragend' };
  fakePolylineObject.addListener = sinon.stub().callsArgWith(1, fakeEventObject);
  run(() => component.set('polyline', fakePolylineObject));
  component.sendOnDrag = sinon.stub();

  run(() => component.setOnDrag());

  sinon.assert.calledOnce(fakePolylineObject.addListener);
  sinon.assert.calledWith(fakePolylineObject.addListener, 'dragend');

  sinon.assert.calledOnce(component.sendOnDrag);
  sinon.assert.calledWith(component.sendOnDrag, fakeEventObject);
});

test('it sends action `onDrag` on callback for `dragend` event', function() {
  const fakeEventObject = { name: 'dragend' };
  component.sendAction = sinon.stub();

  run(() => component.set('attrs', { onDrag: 'action' }));
  run(() => component.set('polyline', fakePolylineObject));
  run(() => component.sendOnDrag(fakeEventObject));

  sinon.assert.calledOnce(component.sendAction);
  sinon.assert.calledWith(component.sendAction, 'onDrag', fakeEventObject, fakePolylineObject);
});

test('it runs closure action `attrs.onDrag` directly on callback for `dragend` event', function() {
  const fakeEventObject = { name: 'dragend' };
  run(() => component.set('attrs', { onDrag: sinon.stub() }));
  run(() => component.set('polyline', fakePolylineObject));
  run(() => component.sendOnDrag(fakeEventObject));

  sinon.assert.calledOnce(component.attrs.onDrag);
  sinon.assert.calledWith(component.attrs.onDrag, fakeEventObject, fakePolylineObject);
});
