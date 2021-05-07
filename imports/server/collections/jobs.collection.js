import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { createIndex } from '/imports/server/helpers.js';
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

Meteor.publish('job', function (number) {
  check(number, String);
  if (!this.userId) {
    return [];
  }

  return jobs.find({ number });
});

createIndex(jobs, { number: 1 }, { background: false });
