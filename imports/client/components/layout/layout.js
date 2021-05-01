import { app } from '/imports/lib/app.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import '/imports/client/components/login-form/login-form.js';
import './animations.sass';
import './layout.sass';
import './layout.jade';

Template.loginLogoutButton.onCreated(function () {
  this.loggingOut = new ReactiveVar(false);
});

Template.layout.helpers({
  getYear() {
    return new Date().getFullYear();
  },
  getYieldClass() {
    return app.yieldClass.get();
  },
  canYeild() {
    return !!Meteor.userId() || FlowRouter._current.route.options?.isPublic === true;
  }
});

Template.loginLogoutButton.helpers({
  loggingOut() {
    return Template.instance().loggingOut.get();
  }
});

Template.loginLogoutButton.events({
  'click [data-logout]'(e, template) {
    e.preventDefault();
    template.loggingOut.set(true);
    setTimeout(() => {
      Meteor.logout((error) => {
        template.loggingOut.set(false);
        if (error) {
          console.error(error);
        }
      });
    }, 1024);
    return false;
  }
});
