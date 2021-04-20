import { app } from '/imports/lib/app.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './animations.sass';
import './layout.sass';
import './layout.jade';

Template.layout.onCreated(function () {
  this.loggingOut = new ReactiveVar(false);
});

Template.layout.helpers({
  getYear() {
    return new Date().getFullYear();
  },
  loggingOut() {
    return Template.instance().loggingOut.get();
  },
  getYieldClass() {
    return app.yieldClass.get();
  }
});

Template.layout.events({
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
