import { app } from '/imports/lib/app.js';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

const templates = {
  layout: 'layout'
};

let firstTime = true;
let loadingElement;
const ensureLoadingElement = () => {
  if (!loadingElement) {
    loadingElement = document.getElementById('loadingElement');
  }
};

const onRendered = function () {
  ensureLoadingElement();
  setTimeout(() => {
    firstTime = false;
    app.yieldClass.set('animated bounceInRight');
    setTimeout(() => {
      loadingElement.style.display = 'none';
    }, 512);
  }, 512);
};

const whileWaiting = function () {
  ensureLoadingElement();
  if (!firstTime) {
    app.yieldClass.set('animated bounceOutLeft');
  }
  loadingElement.style.display = 'flex';
};

const render = (route, ...args) => {
  setTimeout(() => {
    route.render(...args, onRendered);
  }, 512);
};

FlowRouter.route('/', {
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
