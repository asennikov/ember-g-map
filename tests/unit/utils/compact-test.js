import compact from 'ember-g-map/utils/compact';
import { module, test } from 'qunit';

module('Unit | Utility | compact');

test('compact returns an object with empty elements removed', function(assert) {
  const object = {
    a: '1',
    b: 2,
    c: undefined,
    'abc': null,
    key: ''
  };
  const expectedResult = {
    a: '1',
    b: 2
  };

  const result = compact(object);
  assert.deepEqual(result, expectedResult, 'it does not contain empty elements');
});
