import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('g-map-clusterer', 'Integration | Component | g map clusterer', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`
    {{#g-map as |context|}}
      {{g-map-clusterer context}}
    {{/g-map}}
  `);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#g-map as |context|}}
      {{#g-map-clusterer context}}
        template block text
      {{/g-map-clusterer}}
    {{/g-map}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
