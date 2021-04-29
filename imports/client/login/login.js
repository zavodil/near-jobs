import { app } from '/imports/lib/app.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import '/imports/client/components/login-form/login-form.js';
import './login.jade';

Template.login.onRendered(app.isReady);

Template.login.onCreated(function () {
  this.autorun(() => {
    const user = Meteor.user();
    if (user) {
      let redirectTo = 'index';
      if (!user.profile.type) {
        redirectTo = 'signup';
      }
      FlowRouter.go(redirectTo);
    }
  });
});
