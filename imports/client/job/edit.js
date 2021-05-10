import { app } from '/imports/lib/app.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { jobs as jobsCollection } from '/imports/lib/collections/jobs.collection.js';
import '/imports/client/components/job-form/job-form.js';
import './edit.jade';

Template.editjob.onRendered(app.isReady);

Template.editjob.onCreated(function () {
  this.user = Meteor.user();
  if (!this.user) {
    FlowRouter.go('index');
  }

  this.job = jobsCollection.findOne({
    owner: this.user._id
  });

  if (!this.job) {
    FlowRouter.go('index');
  }
});


Template.editjob.helpers({
  formData() {
    const job = Template.instance().job;

    if (!job) {
      return {};
    }

    return {
      ...job,
      skillsText: (job.skills || []).join(', '),
      categoryText: (job.category || []).join(', '),
      availabilityText: (job.availability || []).join(', '),
      isUpdate: true
    };
  }
});
