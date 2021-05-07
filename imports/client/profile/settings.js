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
  this.managingAccount = new ReactiveVar(false);

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
    template.managingAccount.set(true);

    Meteor.call('github.issue.profile.close', (error) => {
      if (error) {
        console.error(error);
        if (error.error === 422) {
          alert('Your profile issue was managed by GitHub administrator, account got locked; if you believe there\'s an error contact Near Jobs support via GitHub issues');
        } else {
          alert('Something went wrong, server returned an error! Please, try again later');
        }
      }
      template.managingAccount.set(false);
    });
    return false;
  },
  'click [data-reopen-profile]'(e, template) {
    e.preventDefault();
    template.managingAccount.set(true);

    Meteor.call('github.issue.profile.reopen', (error) => {
      if (error) {
        console.error(error);
        if (error.error === 422) {
          alert('Your profile issue was managed by GitHub administrator, account got locked; if you believe there\'s an error contact Near Jobs support via GitHub issues');
        } else {
          alert('Something went wrong, server returned an error! Please, try again later');
        }
      }
      template.managingAccount.set(false);
    });
    return false;
  }
});

Template.profileSettings.helpers({
  loggingOut() {
    return Template.instance().loggingOut.get();
  },
  managingAccount() {
    return Template.instance().managingAccount.get();
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
      header: profile.type === 'company' ? 'Edit <b>company</b> profile' : 'Edit <b>your</b> profile',
      isUpdate: true
    };
  }
});
