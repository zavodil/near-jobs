import { app } from '/imports/lib/app.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import './profile-form.jade';

Template.profileForm.onCreated(function () {
  this.isLoading = new ReactiveVar(false);
  this.accountType = new ReactiveVar(false);
  this.errorFields = new ReactiveVar({});
  this.hasChanges = new ReactiveVar(false);
  this.isSaved = new ReactiveVar(false);
});

Template.profileForm.onRendered(function () {
  if (this.data.isUpdate === true) {
    if (this.data?.type) {
      this.accountType.set(this.data.type);
    }
  }
});

Template.profileForm.helpers({
  isLoading() {
    return Template.instance().isLoading.get();
  },
  accountType() {
    return Template.instance().accountType.get();
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

Template.profileForm.events({
  'change select, input textarea, input input'(e, template) {
    template.hasChanges.set(true);
    template.isSaved.set(false);
  },
  'change [data-account-type], input [data-account-type]'(e, template) {
    template.accountType.set(e.currentTarget.value);
  },
  'submit [data-profile-form]'(e, template) {
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

    Meteor.call('github.issue.profile', form.accountType, form, (error, res) => {
      setTimeout(() => {
        template.isLoading.set(false);
        if (error) {
          console.error(error);
          if (error.error === 422) {
            alert('Your issue was closed by GitHub administrator, you can not proceed further, this account got locked; If you believe there\'s a mistake reach out Near Jobs support via GitHub issues');
          } else if (error.error === 400) {
            alert(error.reason);
          } else {
            alert('Something went wrong. Please, check that you don\'t have duplicate "profile" issue in our GitHub repository with your profile. Make sure your original issue is open and try again');
          }
        } else if (res?.errorFields) {
          template.errorFields.set(res.errorFields);
        } else if (res === true) {
          if (FlowRouter._current.route.name === 'signup') {
            if (form.accountType === 'company') {
              FlowRouter.go('newjob');
            } else {
              if (app.afterLoginRedirect) {
                FlowRouter.go(app.afterLoginRedirect.name, app.afterLoginRedirect);
              } else {
                FlowRouter.go('searchJobs');
              }
            }
          } else {
            template.isSaved.set(true);
            template.hasChanges.set(false);
          }
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
