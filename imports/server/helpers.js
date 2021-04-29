/**
 * Create (ensure) index on MongoDB collection, catch and log exception if thrown
 * @function createIndex
 * @param {Mongo.Collection} collection - Mongo.Collection instance
 * @param {object} keys - Field and value pairs where the field is the index key and the value describes the type of index for that field
 * @param {object} opts - Set of options that controls the creation of the index
 * @returns {void 0}
 */
const createIndex = (collection, keys, opts) => {
  try {
    collection.rawCollection().createIndex(keys, opts);
  } catch (e) {
    console.error(`Can not set ${Object.keys(keys).join(' + ')} index on "${collection._name}" collection`, { keys, opts, details: e });
  }
};

export { createIndex };
