import resolver from './helpers/resolver';
import TestLoader from 'ember-cli-test-loader/test-support';
import {
  setResolver
} from 'ember-qunit';

setResolver(resolver);
TestLoader.load();
