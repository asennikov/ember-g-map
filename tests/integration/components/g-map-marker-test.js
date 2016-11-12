import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('g-map-marker', 'Integration | Component | g map marker', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`
    {{#g-map as |context|}}
      {{g-map-marker context}}
    {{/g-map}}
  `);

  assert.ok(this.$());

  // Template block usage:
  this.render(hbs`
    {{#g-map as |context|}}
      {{#g-map-marker context}}
        template block text
      {{/g-map-marker}}
    {{/g-map}}
  `);

  assert.ok(this.$());
});
