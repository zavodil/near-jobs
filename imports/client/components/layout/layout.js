import { app } from '/imports/lib/app.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import '/imports/client/components/login-form/login-form.js';
import './animations.sass';
import './layout.sass';
import './layout.jade';

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
