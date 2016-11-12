import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('g-map-polyline', 'Integration | Component | g map polyline', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  // Template block usage:
  this.render(hbs`
    {{#g-map as |context|}}
      {{#g-map-polyline context as |coordinateContext|}}
        {{g-map-polyline-coordinate coordinateContext lat=37.7933 lng=-122.4567}}
        {{g-map-polyline-coordinate coordinateContext lat=37.7933 lng=-122.4667}}
      {{/g-map-polyline}}
    {{/g-map}}
  `);

  assert.ok(this.$());
});
