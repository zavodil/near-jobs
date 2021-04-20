import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './signup-form.jade';

Template.signupForm.onCreated(function () {
  this.isLoading = new ReactiveVar(false);
  this.accountType = new ReactiveVar(false);
});

Template.signupForm.helpers({
  isLoading() {
    return Template.instance().isLoading.get();
  },
  accountType() {
    return Template.instance().accountType.get();
  }
});

Template.signupForm.events({
  'change [data-account-type], input [data-account-type]'(e, template) {
    console.log(e.currentTarget.dataset)
    template.accountType.set(e.currentTarget.value);
  },
  'click [data-save]'(e, template) {
    e.preventDefault();
    template.isLoading.set(true);
    
    return false;
  },
  'click [data-add-to]'(e, template) {
    e.preventDefault();
    const input = template.find(`#${e.currentTarget.dataset.addTo}`);
    if (!input) {
      return false;
    }
    const newEntry = e.currentTarget.dataset.add;
    if (input.value.includes(newEntry) || /^([^,]*,){3}[^,]*$/.test(input.value)) {
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
