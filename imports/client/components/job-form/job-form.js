import { app } from '/imports/lib/app.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import './job-form.jade';

Template.jobForm.onCreated(function () {
  this.isLoading = new ReactiveVar(false);
  this.errorFields = new ReactiveVar({});
  this.hasChanges = new ReactiveVar(false);
  this.isSaved = new ReactiveVar(false);
});

Template.jobForm.helpers({
  isLoading() {
    return Template.instance().isLoading.get();
  },
  getError(elementId) {
    return (Template.instance().errorFields.get() || {})[elementId];
  },
  hasChanges() {
    return Template.instance().hasChanges.get();
  },
  hasErrors() {
    return !!Object.keys(Template.instance().errorFields.get() || {}).length;
  },
  isSaved() {
    return Template.instance().isSaved.get();
  }
});

Template.jobForm.events({
  'change select, input textarea, input input'(e, template) {
    template.hasChanges.set(true);
    template.isSaved.set(false);
  },
  'submit [data-job-form]'(e, template) {
    e.preventDefault();

    if (template.isLoading.get()) {
      return false;
    }

    const elements = template.findAll('input,select,textarea,checkbox');
    const { form, errorFields } = app.processFormElements(elements);

    if (form.city && !form.country) {
      errorFields.country = 'Country is required when City is filled-out';
    }

    if (Object.keys(errorFields).length) {
      template.errorFields.set(errorFields);
      return false;
    }

    template.errorFields.set({});
    template.isLoading.set(true);

    if (template.data.isUpdate === true) {
      form.isUpdate = true;
    }

    Meteor.call('github.issue.job', form, (error, res) => {
      setTimeout(() => {
        template.isLoading.set(false);
        if (error) {
          console.error(error);
          if (error.error === 422) {
            alert('Job issue was closed by GitHub administrator, you can not proceed further, job post account got locked; If you believe there\'s a mistake reach out Near Jobs support via GitHub issues');
          } else {
            alert('Something went wrong. Please, check that you don\'t have duplicate "job" issue in our GitHub repository with job posts. Make sure original job-issue is open and try again');
          }
        } else if (res?.errorFields) {
          template.errorFields.set(res.errorFields);
        } else if (res && !isNaN(res) && !form.isUpdate) {
          FlowRouter.go('job', { number: res });
        }
      }, 256);
    });
    return false;
  },
  'click [data-add-to]'(e, template) {
    e.preventDefault();
    return app.addToInput(e, template);
  }
});
