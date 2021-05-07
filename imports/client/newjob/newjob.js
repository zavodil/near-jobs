import { app } from '/imports/lib/app.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import '/imports/client/components/job-form/job-form.js';
import './newjob.jade';

Template.newjob.onRendered(app.isReady);

Template.newjob.onCreated(function () {
  this.autorun(() => {
    
  });
});
