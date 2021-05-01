import { app } from '/imports/lib/app.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import '/imports/client/components/profile-form/profile-form.js';
import './signup.jade';

Template.signup.onRendered(app.isReady);

Template.signup.onCreated(function () {
  const user = Meteor.user();
  if (!user) {
    FlowRouter.go('login');
  } else if (user.profile.type) {
    FlowRouter.go('index');
  }
});
