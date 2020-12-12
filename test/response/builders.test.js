jest.mock('../../lib/models');

const builders = require('../../lib/response/builders');
const models = require('../../lib/models');

models.buildResourceSchema.mockImplementation((collection, schema) => {
  return schema;
});
models.buildCollectionSchema.mockImplementation((collection, schema) => {
  return { [collection]: schema };
});

describe('Response Builders Tests', () => {
  const collectionName = 'tests';
  const schema = 'testSchema';

  it('#getCollectionResponseBuilder should return the proper response validation', () => {
    const expectedResponseValidation = { status: { 200: { tests: 'testSchema' } } };
    const actualResponseValidation = builders.getCollectionResponseBuilder(collectionName, schema);

    expect(actualResponseValidation).toStrictEqual(expectedResponseValidation);
  });

  it('#getResourceResponseBuilder should return the proper response validation', () => {
    const expectedResponseValidation = { status: { 200: 'testSchema' } };
    const actualResponseValidation = builders.getResourceResponseBuilder(collectionName, schema);

    expect(actualResponseValidation).toStrictEqual(expectedResponseValidation);
  });

  it('#createResourceResponseBuilder should return the proper response validation', () => {
    const expectedResponseValidation = { status: { 200: 'testSchema' } };
    const actualResponseValidation = builders.createResourceResponseBuilder(collectionName, schema);

    expect(actualResponseValidation).toStrictEqual(expectedResponseValidation);
  });

  it('#updateResourceResponseBuilder should return the proper response validation', () => {
    const expectedResponseValidation = { status: { 200: 'testSchema' } };
    const actualResponseValidation = builders.updateResourceResponseBuilder(collectionName, schema);

    expect(actualResponseValidation).toStrictEqual(expectedResponseValidation);
  });

  it('#deleteResourceResponseBuilder should return the proper response validation', () => {
    const actualResponseValidation = builders.deleteResourceResponseBuilder(collectionName, schema);

    expect(actualResponseValidation).toStrictEqual({});
  });
});
