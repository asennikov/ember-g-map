import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('g-map-route-waypoint', 'Integration | Component | g map route waypoint', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(2);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`
    {{#g-map as |mapContext|}}
      {{#g-map-route mapContext as |routeContext|}}
        {{g-map-route-waypoint routeContext}}
      {{/g-map-route}}
    {{/g-map}}`);

  assert.ok(this.$());

  // Template block usage:
  this.render(hbs`
    {{#g-map as |mapContext|}}
      {{#g-map-route mapContext as |routeContext|}}
        {{#g-map-route-waypoint routeContext}}
          template block text
        {{/g-map-route-waypoint}}
      {{/g-map-route}}
    {{/g-map}}
  `);

  assert.ok(this.$());
});
