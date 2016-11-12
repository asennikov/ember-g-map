import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('g-map-address-marker', 'Integration | Component | g map address marker', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`
    {{#g-map as |context|}}
      {{g-map-address-marker context}}
    {{/g-map}}
  `);

  assert.ok(this.$());

  // Template block usage:
  this.render(hbs`
    {{#g-map as |context|}}
      {{#g-map-address-marker context}}
        template block text
      {{/g-map-address-marker}}
    {{/g-map}}
  `);

  assert.ok(this.$());
});
