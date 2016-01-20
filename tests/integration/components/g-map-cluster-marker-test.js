import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('g-map-cluster-marker', 'Integration | Component | g map cluster marker', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`
    {{#g-map as |context|}}
      {{#g-map-clusterer context as |clustererContext|}}
        {{g-map-cluster-marker clustererContext}}
      {{/g-map-clusterer}}
    {{/g-map}}
  `);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#g-map as |context|}}
      {{#g-map-clusterer context as |clustererContext|}}
        {{#g-map-cluster-marker clustererContext}}
          template block text
        {{/g-map-cluster-marker}}
      {{/g-map-clusterer}}
    {{/g-map}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
