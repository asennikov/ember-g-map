import Ember from 'ember';
import { moduleForComponent } from 'ember-qunit';
import test from '../../ember-sinon-qunit/test';
import GMapComponent from 'ember-g-map/components/g-map';
import sinon from 'sinon';

const { run } = Ember;

let fakePolylineObject;
let component;

moduleForComponent('g-map-polyline', 'Unit | Component | g map polyline', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true,

  beforeEach() {
    fakePolylineObject = {
      setPath: sinon.stub(),
      setMap: sinon.stub(),
      setOptions: sinon.stub(),
      addListener: sinon.stub()
    };
    sinon.stub(google.maps, 'Polyline').returns(fakePolylineObject);
    component = this.subject({
      mapContext: new GMapComponent()
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

test('it triggers `setOnClick` on `didInsertElement` event', function() {
  component.setOnClick = sinon.stub();
  component.trigger('didInsertElement');
  sinon.assert.calledOnce(component.setOnClick);
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
  fakePolylineObject.addListener = sinon.stub().callsArg(1);
  run(() => component.set('polyline', fakePolylineObject));
  component.sendOnClick = sinon.stub();

  run(() => component.setOnClick());

  sinon.assert.calledOnce(fakePolylineObject.addListener);
  sinon.assert.calledWith(fakePolylineObject.addListener, 'click');

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
