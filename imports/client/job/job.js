import { app } from '/imports/lib/app.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { jobs as jobsCollection } from '/imports/lib/collections/jobs.collection.js';
import '/imports/client/_404/_404.js';
import '/imports/client/components/markdown/markdown-body.css';
import './job.jade';

Template.job.onRendered(app.isReady);

Template.job.onCreated(function () {
  this.openApply = new ReactiveVar(false);
  this.isProcessing = new ReactiveVar(false);
  this.errorFields = new ReactiveVar({});
});

Template.job.helpers({
  openApply() {
    return Template.instance().openApply.get();
  },
  isProcessing() {
    return Template.instance().isProcessing.get();
  },
  job() {
    const template = Template.instance();
    if (!template) {
      return {};
    }
    return jobsCollection.findOne({
      'issue.number': parseInt(template.data.number)
    });
  },
  isApplied() {
    const user = Meteor.user();
    if (!user) {
      return false;
    }

    return user.profile.applied?.includes(this.issue.number);
  },
  getError(elementId) {
    return (Template.instance().errorFields.get() || {})[elementId];
  }
});

Template.job.events({
  'click [data-toggle-apply]'(e, template) {
    e.preventDefault();
    template.openApply.set(!template.openApply.get());
    return false;
  },
  'click [data-job-open]'(e, template) {
    e.preventDefault();

    template.isProcessing.set(true);
    Meteor.call('github.issue.job.open', this.issue.number, (error) => {
      setTimeout(() => {
        template.isProcessing.set(false);
        if (error) {
          console.error(error);
          alert('Unexpected error occurred. Please, try again later');
        }
      }, 768);
    });
    return false;
  },
  'click [data-job-close]'(e, template) {
    e.preventDefault();

    template.isProcessing.set(true);
    Meteor.call('github.issue.job.close', this.issue.number, (error) => {
      setTimeout(() => {
        template.isProcessing.set(false);
        if (error) {
          console.error(error);
          alert('Unexpected error occurred. Please, try again later');
        }
      }, 768);
    });
    return false;
  },
  'submit [data-apply]'(e, template) {
    e.preventDefault();

    const form = {
      number: this.issue.number,
      body: e.currentTarget.coverLetter.value
    };

    if (form.body.length < 130) {
      template.errorFields.set({
        coverLetter: 'We encourage you to write comprehensive cover letter with your credentials (at least 130 symbols)'
      });
      return false;
    }

    template.errorFields.set({});
    template.isProcessing.set(true);

    Meteor.call('github.issue.job.apply', form, (error) => {
      setTimeout(() => {
        template.isProcessing.set(false);
        if (error) {
          console.error(error);
          alert('Unexpected error occurred. Please, try again later');
        } else {
          template.openApply.set(false);
        }
      }, 768);
    });
    return false;
  }
});
