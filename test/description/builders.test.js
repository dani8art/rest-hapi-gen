const builders = require('../../lib/description/builders');

describe('Description Builders Tests', () => {
  const collectionName = 'tests';

  it('#getCollectionDescriptionBuilder should return the proper description', () => {
    const actualDecription = builders.getCollectionDescriptionBuilder(collectionName);

    expect(actualDecription).toBe('Gets all tests');
  });

  it('#getResourceDescriptionBuilder should return the proper description', () => {
    const actualDecription = builders.getResourceDescriptionBuilder(collectionName);

    expect(actualDecription).toBe('Gets an existing test');
  });

  it('#createResourceDescriptionBuilder should return the proper description', () => {
    const actualDecription = builders.createResourceDescriptionBuilder(collectionName);

    expect(actualDecription).toBe('Creates a new test');
  });

  it('#updateResourceDescriptionBuilder should return the proper description', () => {
    const actualDecription = builders.updateResourceDescriptionBuilder(collectionName);

    expect(actualDecription).toBe('Updates an existing test');
  });

  it('#deleteResourceDescriptionBuilder should return the proper description', () => {
    const actualDecription = builders.deleteResourceDescriptionBuilder(collectionName);

    expect(actualDecription).toBe('Deletes an existing test');
  });
});
