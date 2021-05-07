import { app } from '/imports/lib/app.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { ReactiveVar } from 'meteor/reactive-var';
import { profiles as profilesCollection } from '/imports/lib/collections/profiles.collection.js';
import '/imports/client/components/profile-form/profile-form.js';
import './settings.jade';

Template.profileSettings.onRendered(app.isReady);

Template.profileSettings.onCreated(function () {
  this.loggingOut = new ReactiveVar(false);
  this.isClosing = new ReactiveVar(false);

  this.user = Meteor.user();
  if (!this.user) {
    FlowRouter.go('index');
  }

  this.profile = profilesCollection.findOne({
    owner: this.user._id
  });

  if (!this.profile) {
    FlowRouter.go('index');
  }
});

Template.profileSettings.events({
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
  },
  'click [data-close-profile]'(e, template) {
    e.preventDefault();
    template.isClosing.set(true);

    setTimeout(() => {
      alert('Sorry, not yet implemented');
      template.isClosing.set(false);
    }, 1024);
    return false;
  }
});

Template.profileSettings.helpers({
  loggingOut() {
    return Template.instance().loggingOut.get();
  },
  isClosing() {
    return Template.instance().isClosing.get();
  },
  formData() {
    const profile = Template.instance().profile;

    if (!profile) {
      return {};
    }

    return {
      ...profile,
      skillsText: (profile.skills || []).join(', '),
      categoryText: (profile.category || []).join(', '),
      availabilityText: (profile.availability || []).join(', '),
      header: '<b>Edit</b> your profile',
      isUpdate: true
    };
  }
});
