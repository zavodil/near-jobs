import { profiles } from '/imports/lib/collections/profiles.collection.js';

profiles.deny({
  insert() {
    return true;
  },
  update() {
    return true;
  },
  remove() {
    return true;
  }
});
