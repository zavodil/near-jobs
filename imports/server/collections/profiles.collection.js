import { createIndex } from '/imports/server/helpers.js';
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

createIndex(profiles, { 'user.login': 1 }, { background: true });
