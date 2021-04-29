import { app } from '/imports/lib/app.js';

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

const templates = {
  layout: 'layout'
};

export { render, whileWaiting, onRendered, ensureLoadingElement, templates };
