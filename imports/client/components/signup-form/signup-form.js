import { app } from '/imports/lib/app.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import './signup-form.jade';

Template.signupForm.onCreated(function () {
  this.isLoading = new ReactiveVar(false);
  this.accountType = new ReactiveVar(false);
  this.errorFields = new ReactiveVar({});
});

Template.signupForm.helpers({
  isLoading() {
    return Template.instance().isLoading.get();
  },
  accountType() {
    return Template.instance().accountType.get();
  },
  getError(elementId) {
    return (Template.instance().errorFields.get() || {})[elementId];
  },
  hasErrors() {
    return !!Object.keys(Template.instance().errorFields.get() || {}).length;
  }
});

Template.signupForm.events({
  'change [data-account-type], input [data-account-type]'(e, template) {
    template.accountType.set(e.currentTarget.value);
  },
  'submit [data-signup]'(e, template) {
    e.preventDefault();

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

    Meteor.call('github.issue.signup', form.accountType, form, (error, res) => {
      template.isLoading.set(false);
      if (error) {
        console.error(error);
        alert('Something went wrong. Please, try again');
      } else if (res?.errorFields) {
        template.errorFields.set(res.errorFields);
      } else if (res === true) {
        FlowRouter.go('index');
      }
    });
    return false;
  },
  'click [data-add-to]'(e, template) {
    e.preventDefault();
    const input = template.find(`#${e.currentTarget.dataset.addTo}`);
    if (!input) {
      return false;
    }

    const values = input.value.split(',').map(val => app.slugify(val));
    const maxOptions = parseInt(input.dataset.maxOptions);
    const newEntry = e.currentTarget.dataset.add;

    if (input.value.includes(newEntry) || values.length >= maxOptions) {
      return false;
    }
    if (input.value.length) {
      input.value += `, ${newEntry}`;
    } else {
      input.value = newEntry;
    }
    return false;
  }
});
