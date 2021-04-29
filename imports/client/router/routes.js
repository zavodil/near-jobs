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

FlowRouter.route('/new/job', {
  isPublic: false,
  name: 'newjob',
  title: 'Signup to NEAR Protocol Job Board',
  action() {
    render(this, templates.layout, 'newjob');
  },
  waitOn() {
    return import('/imports/client/newjob/newjob.js');
  },
  whileWaiting
});

