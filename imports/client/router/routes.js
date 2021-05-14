import { app } from '/imports/lib/app.js';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { render, whileWaiting, templates } from './helpers.js';

FlowRouter.route('/', {
  isPublic: true,
  name: 'index',
  action() {
    render(this, templates.layout, 'index');
  },
  waitOn() {
    return import('/imports/client/index/index.js');
  },
  whileWaiting
});

FlowRouter.route('/login', {
  isPublic: true,
  name: 'login',
  title: 'Login to NEAR Protocol Job Board',
  action() {
    render(this, templates.layout, 'login');
  },
  waitOn() {
    return import('/imports/client/login/login.js');
  },
  whileWaiting
});

FlowRouter.route('/signup', {
  isPublic: false,
  name: 'signup',
  title: 'Signup to NEAR Protocol Job Board',
  action() {
    render(this, templates.layout, 'signup');
  },
  waitOn() {
    return import('/imports/client/signup/signup.js');
  },
  whileWaiting
});

FlowRouter.route('/job/new', {
  isPublic: false,
  name: 'newjob',
  title: 'Create new job post',
  action() {
    render(this, templates.layout, 'newjob');
  },
  waitOn() {
    return import('/imports/client/job/new.js');
  },
  whileWaiting
});

FlowRouter.route('/job/:number', {
  isPublic: true,
  name: 'job',
  title: 'View a job post',
  action(params) {
    render(this, templates.layout, 'job', params);
  },
  waitOn(params) {
    return [
      import('/imports/client/job/job.js'),
      Meteor.subscribe('job', params.number)
    ];
  },
  whileWaiting
});

FlowRouter.route('/job/:number/edit', {
  isPublic: false,
  name: 'editjob',
  title: 'Edit a job post',
  action(params) {
    render(this, templates.layout, 'editjob', params);
  },
  waitOn(params) {
    return [
      import('/imports/client/job/edit.js'),
      Meteor.subscribe('job', params.number)
    ];
  },
  whileWaiting
});

FlowRouter.route('/profile/settings', {
  isPublic: false,
  name: 'profileSettings',
  title: 'Profile settings',
  action() {
    render(this, templates.layout, 'profileSettings');
  },
  waitOn() {
    return [
      import('/imports/client/profile/settings.js'),
      Meteor.subscribe('profile')
    ];
  },
  whileWaiting
});

FlowRouter.route('/profile/:number', {
  isPublic: true,
  name: 'profilePage',
  title: 'Profile Page',
  action(params) {
    render(this, templates.layout, 'profilePage', params);
  },
  waitOn(params) {
    return [
      import('/imports/client/profile/page.js'),
      Meteor.subscribe('profilePage', parseInt(params.number)),
      Meteor.subscribe('jobByProfile', parseInt(params.number), 'open')
    ];
  },
  whileWaiting
});

FlowRouter.route('/profile/:number/jobs', {
  isPublic: true,
  name: 'profileJobs',
  title: 'Company Jobs',
  action(params) {
    render(this, templates.layout, 'profileJobs', params);
  },
  waitOn(params) {
    return [
      import('/imports/client/profile/jobs.js'),
      Meteor.subscribe('jobByProfile', parseInt(params.number), 'any')
    ];
  },
  whileWaiting
});

FlowRouter.route('/search/jobs', {
  isPublic: true,
  name: 'searchJobs',
  title: 'Search Jobs',
  action() {
    if (app.search.type.get() !== 'jobs') {
      if (!app.search.doNotReset) {
        app.search.query.set('');
      } else {
        app.search.doNotReset = false;
      }
      app.search.type.set('jobs');
    }
    app.search.page.set(1);
    render(this, templates.layout, 'search', { headline: 'Jobs', description: 'Find your next role in the cryptocurrency and blockchain project' });
  },
  waitOn() {
    return import('/imports/client/search/search.js');
  },
  whileWaiting
});

FlowRouter.route('/search/projects', {
  isPublic: true,
  name: 'searchProjects',
  title: 'Search Projects',
  action() {
    if (app.search.type.get() !== 'projects') {
      if (!app.search.doNotReset) {
        app.search.query.set('');
      } else {
        app.search.doNotReset = false;
      }
      app.search.type.set('projects');
    }
    app.search.page.set(1);
    render(this, templates.layout, 'search', { headline: 'Projects', description: 'Discover projects and companies utilizing cryptocurrency and blockchain technology stacks' });
  },
  waitOn() {
    return import('/imports/client/search/search.js');
  },
  whileWaiting
});

FlowRouter.route('/search/candidates', {
  isPublic: true,
  name: 'searchCandidates',
  title: 'Search Candidates',
  action() {
    if (app.search.type.get() !== 'candidates') {
      if (!app.search.doNotReset) {
        app.search.query.set('');
      } else {
        app.search.doNotReset = false;
      }
      app.search.type.set('candidates');
    }
    app.search.page.set(1);
    render(this, templates.layout, 'search', { headline: 'Candidates', description: 'Find a new teammate for ongoing or your next job in cryptocurrency and blockchain ecosystems' });
  },
  waitOn() {
    return import('/imports/client/search/search.js');
  },
  whileWaiting
});
