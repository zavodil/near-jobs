import { app } from '/imports/lib/app.js';
import { Template } from 'meteor/templating';
import { jobs as jobsCollection } from '/imports/lib/collections/jobs.collection.js';
import '/imports/client/components/job-preview/job-preview.js';
import './jobs.jade';

Template.profileJobs.onRendered(app.isReady);

Template.profileJobs.onCreated(function () {
  this.number = parseInt(this.data.number);
});

Template.profileJobs.helpers({
  jobs() {
    return jobsCollection.find({
      'user.issue.number': Template.instance()?.number
    });
  }
});
