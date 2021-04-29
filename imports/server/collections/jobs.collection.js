import { jobs } from '/imports/lib/collections/jobs.collection.js';

jobs.deny({
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
