import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('g-map-infowindow', 'Integration | Component | g map infowindow', {
  integration: true
});

test('it renders inside {{g-map}} component', function(assert) {
  assert.expect(2);

  this.render(hbs`
    {{#g-map as |context|}}
      {{g-map-infowindow context}}
    {{/g-map}}
  `);

  assert.ok(this.$());

  this.render(hbs`
    {{#g-map as |context|}}
      {{#g-map-infowindow context}}
        template block text
      {{/g-map-infowindow}}
    {{/g-map}}
  `);

  assert.ok(this.$());
});

test('it renders inside {{g-map-marker}} component', function(assert) {
  assert.expect(2);

  this.render(hbs`
    {{#g-map as |context|}}
      {{#g-map-marker context as |markerContext|}}
        {{g-map-infowindow markerContext}}
      {{/g-map-marker}}
    {{/g-map}}
  `);

  assert.ok(this.$());

  this.render(hbs`
    {{#g-map as |context|}}
      {{#g-map-marker context as |markerContext|}}
        {{#g-map-infowindow markerContext}}
          template block text
        {{/g-map-infowindow}}
      {{/g-map-marker}}
    {{/g-map}}
  `);

  assert.ok(this.$());
});
