import { isPresent } from '@ember/utils';

export default function(objectInstance) {
  const compactedObject = {};

  for (let key in objectInstance) {
    const value = objectInstance[key];

    if (isPresent(value)) {
      compactedObject[key] = value;
    }
  }

  return compactedObject;
}
