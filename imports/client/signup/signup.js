import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import '/imports/client/components/signup-form/signup-form.js';
import './signup.jade';

Template.signup.onCreated(function () {
  this.autorun(() => {
    const user = Meteor.user();
    if (!user) {
      FlowRouter.go('login');
    } else if (user.profile.type) {
      FlowRouter.go('index');
    }
  });
});
