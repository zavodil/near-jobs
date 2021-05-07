import { app } from '/imports/lib/app.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import './job.jade';

Template.job.onRendered(app.isReady);

Template.job.onCreated(function () {
  this.autorun(() => {
    
  });
});
