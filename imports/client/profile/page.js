import { app } from '/imports/lib/app.js';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
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

Template.profilePage.events({
  'click [data-tag]'(e, template) {
    e.preventDefault();
    const cat = e.currentTarget.dataset.tag;
    const tag = `${this}`;

    app.search.doNotReset = true;
    const query = app.search.query.get();
    if (query) {
      app.search.query.set(`${query} ${cat}:${tag}`);
    } else {
      app.search.query.set(`${cat}:${tag}`);
    }

    if (template.profile?.type === 'candidate') {
      FlowRouter.go('searchCandidates');
    } else if (template.profile?.type === 'company') {
      FlowRouter.go('searchProjects');
    }
    return false;
  }
});
