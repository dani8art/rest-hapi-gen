const builders = require('../../lib/description/builders');

describe('Description Builders Tests', () => {
  const collectionName = 'tests';

  it('#getCollectionDescriptionBuilder should return the proper description', () => {
    const actualDecription = builders.getCollectionDescriptionBuilder(collectionName);

    expect(actualDecription).toBe('Get all tests');
  });

  it('#getResourceDescriptionBuilder should return the proper description', () => {
    const actualDecription = builders.getResourceDescriptionBuilder(collectionName);

    expect(actualDecription).toBe('Get an existing tests');
  });

  it('#createResourceDescriptionBuilder should return the proper description', () => {
    const actualDecription = builders.createResourceDescriptionBuilder(collectionName);

    expect(actualDecription).toBe('Create a new tests');
  });

  it('#updateResourceDescriptionBuilder should return the proper description', () => {
    const actualDecription = builders.updateResourceDescriptionBuilder(collectionName);

    expect(actualDecription).toBe('Update an existing tests');
  });

  it('#deleteResourceDescriptionBuilder should return the proper description', () => {
    const actualDecription = builders.deleteResourceDescriptionBuilder(collectionName);

    expect(actualDecription).toBe('Delete an existing tests');
  });
});
