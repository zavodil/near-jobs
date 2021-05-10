import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
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
  check(number, number);
  return jobs.find({ 'issue.number': parseInt(number) }, {
    fields: {
      _id: 1,
      body: 1,
      issue: 1,
      owner: 1,
      company: 1,
      category: 1,
      location: 1,
      availability: 1,
      isRemote: 1,
      skills: 1,
      title: 1,
      'user.login': 1,
      'user.issue.number': 1
    }
  });
});

Meteor.publish('jobByProfile', function (number, state) {
  check(number, Number);
  check(state, Match.OneOf('open', 'closed', 'any'));

  const search = { 'user.issue.number': number };
  if (state === 'open' || state === 'closed') {
    search['issue.state'] = state;
  }

  return jobs.find(search, {
    fields: {
      _id: 1,
      title: 1,
      owner: 1,
      company: 1,
      category: 1,
      location: 1,
      isRemote: 1,
      availability: 1,
      'issue.number': 1,
      'issue.state': 1,
      'user.issue.number': 1
    }
  });
});

createIndex(jobs, { owner: 1 }, { background: true });
createIndex(jobs, { owner: 1, 'issue.state': 1 }, { background: true });
createIndex(jobs, { 'issue.number': 1 }, { background: false });
createIndex(jobs, { 'issue.number': 1, 'issue.state': 1 }, { background: true });
createIndex(jobs, { 'user.issue.number': 1, 'issue.state': 1 }, { background: true });
