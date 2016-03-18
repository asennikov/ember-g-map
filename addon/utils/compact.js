import Ember from 'ember';

export default function(objectInstance) {
  const compactedObject = {};

  for (let key in objectInstance) {
    const value = objectInstance[key];

    if (Ember.isPresent(value)) {
      compactedObject[key] = value;
    }
  }

  return compactedObject;
}
