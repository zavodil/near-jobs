import { Meteor } from 'meteor/meteor';
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

Meteor.publish('profile', function () {
  if (!this.userId) {
    return [];
  }

  return profiles.find({
    owner: this.userId
  });
});

createIndex(profiles, { 'user.login': 1 }, { background: true });
createIndex(profiles, { 'owner': 1 }, { background: true });
createIndex(profiles, { 'issue.number': 1 }, { background: true });
