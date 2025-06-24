function assert(test, msg) {
  if (!test) {
    throw new TypeError(msg);
  }
}

function checkAllowedKeys(reference, ...keys) {
  Object.keys(reference).forEach((key) =>
    assert(
      keys.includes(key),
      `Unexpected key: ${key} Expected one of: ${keys}`,
    ),
  );
}

function checkRequiredKeys(reference, ...keys) {
  keys.forEach((key) =>
    assert(
      Object.prototype.hasOwnProperty.call(reference, key),
      `Required key missing: ${key}`,
    ),
  );
}

function checkSystems(systems) {
  assert(Array.isArray(systems), 'Systems must be an array');
  assert(systems.length, 'Systems array must not be empty');
  systems.forEach((system) =>
    assert(typeof system === 'string', 'System must be of type string'),
  );
}

export default function validate(data) {
  assert(typeof data === 'object' && data !== null);
  checkAllowedKeys(data, 'issues', 'systems', 'onRemediationCreated');
  checkRequiredKeys(data, 'issues');

  assert(Array.isArray(data.issues), 'Issues must be an array');
  assert(data.issues.length, 'Issues array must not be empty');
  data.issues.forEach((issue) => {
    assert(
      typeof issue === 'object' && issue !== null,
      'Issue must be an object',
    );
    checkAllowedKeys(issue, 'id', 'description', 'systems');
    checkRequiredKeys(issue, 'id', 'description');
    Object.prototype.hasOwnProperty.call(issue, 'systems') &&
      checkSystems(issue.systems);
    assert(
      Object.prototype.hasOwnProperty.call(issue, 'systems') ||
        Object.prototype.hasOwnProperty.call(data, 'systems'),
      `No systems defined for ${issue.id}`,
    );
  });

  Object.prototype.hasOwnProperty.call(data, 'systems') &&
    checkSystems(data.systems);
}
