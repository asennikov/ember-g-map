import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('g-map-route', 'Integration | Component | g map route', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`
    {{#g-map as |context|}}
      {{g-map-route context}}
    {{/g-map}}
  `);

  assert.ok(this.$());

  // Template block usage:
  this.render(hbs`
    {{#g-map as |context|}}
      {{#g-map-route context}}
        template block text
      {{/g-map-route}}
    {{/g-map}}
  `);

  assert.ok(this.$());
});
