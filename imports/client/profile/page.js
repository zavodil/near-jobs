import { app } from '/imports/lib/app.js';
import { Template } from 'meteor/templating';
import { jobs as jobsCollection } from '/imports/lib/collections/jobs.collection.js';
import { profiles as profilesCollection } from '/imports/lib/collections/profiles.collection.js';
import '/imports/client/_404/_404.js';
import '/imports/client/components/markdown/markdown-body.css';
import '/imports/client/components/job-preview/job-preview.js';
import './page.jade';

Template.profilePage.onRendered(app.isReady);

Template.profilePage.onCreated(function () {
  this.number = parseInt(this.data.number);
  this.profile = profilesCollection.findOne({
    'issue.number': this.number
  });
});

Template.profilePage.helpers({
  jobs() {
    return jobsCollection.find({
      'user.issue.number': Template.instance()?.number
    });
  },
  profile() {
    return Template.instance().profile;
  }
});
