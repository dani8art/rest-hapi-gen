const builders = require('../../lib/path/builders');

describe('Path Builders Tests', () => {
  const basePath = '/tests/base/path';
  const collectionName = 'tests';

  it('#singularPathBuilder should return the proper path', () => {
    const actualPath = builders.singularPathBuilder(basePath, collectionName);

    expect(actualPath).toMatchSnapshot();
  });

  it('#pluralPathBuilder should return the proper path', () => {
    const actualPath = builders.pluralPathBuilder(basePath, collectionName);

    expect(actualPath).toMatchSnapshot();
  });
});
