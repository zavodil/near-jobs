import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import './login-form.jade';

Template.loginForm.onCreated(function () {
  this.isLoading = new ReactiveVar(false);
});

Template.loginForm.helpers({
  isLoading() {
    return Template.instance().isLoading.get() || Meteor.loggingIn();
  }
});

Template.loginForm.events({
  'click [data-login]'(e, template) {
    e.preventDefault();
    template.isLoading.set(true);
    Meteor.loginWithGithub({
      loginStyle: 'popup',
      requestPermissions: [],
      redirectUrl: Meteor.absoluteUrl('/_oauth/github')
    }, (error) => {
      template.isLoading.set(false);
      if (error) {
        console.error(error);
        alert('Login attempt failed. Please, try again');
      }
    });
    return false;
  }
});
