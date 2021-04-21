import { app } from '/imports/lib/app.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
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
  }
});

Template.signupForm.events({
  'change [data-account-type], input [data-account-type]'(e, template) {
    template.accountType.set(e.currentTarget.value);
  },
  'submit [data-signup]'(e, template) {
    e.preventDefault();
    const errorFields = {};
    const form = {};

    const elements = template.findAll('input,select,textarea,checkbox');

    for (const element of elements) {
      if (element.hasAttribute('required') && element.value.length < 2) {
        errorFields[element.id] = 'This field is required';
      } else if (element.dataset.maxOptions && element.value.split(',').length > parseInt(element.dataset.maxOptions)) {
        errorFields[element.id] = `Options limit exceeded, enter up to ${element.dataset.maxOptions} options`;
      } else if (element.hasAttribute('maxlength') && element.value.length > parseInt(element.getAttribute('maxlength'))) {
        errorFields[element.id] = `Entered value is too long, this field length limit is ${element.getAttribute('maxlength')}`;
      } else {
        if (element.dataset.maxOptions) {
          form[element.name] = element.value.split(',').map(val => app.slugify(val));
        } else {
          form[element.name] = element.value.trim();
        }
      }
    }

    if (Object.keys(errorFields).length) {
      template.errorFields.set(errorFields);
      return false;
    }
    template.isLoading.set(true);
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
