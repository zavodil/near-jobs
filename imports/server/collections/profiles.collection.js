import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
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

Meteor.publish('profilePage', function (number) {
  check(number, Number);

  return profiles.find({
    'issue.number': parseInt(number)
  }, {
    fields: {
      _id: 1,
      body: 1,
      type: 1,
      issue: 1,
      owner: 1,
      company: 1,
      category: 1,
      location: 1,
      availability: 1,
      isRemote: 1,
      skills: 1,
      title: 1,
      user: 1
    }
  });
});


createIndex(profiles, { 'user.login': 1 }, { background: true });
createIndex(profiles, { owner: 1 }, { background: true });
createIndex(profiles, { tags: 1 }, { background: true });
createIndex(profiles, { 'issue.state': 1, tags: 1, type: 1 }, { background: true });
createIndex(profiles, { 'issue.number': 1 }, { background: true });
createIndex(profiles, { title: 'text', body: 'text' }, { background: true });
