import { app } from '/imports/lib/app.js';

/**
 * Handle global first navigation/load logic
 * @type {boolean} firstTime
 */
let firstTime = true;

/**
 * Handle global root element for templates rendering
 * @type {HTMLElement} loadingElement
 */
let loadingElement;

/**
 * Ensure and assign `loadingElement`
 * @function ensureLoadingElement
 * @returns {void 0}
 */
const ensureLoadingElement = () => {
  if (!loadingElement) {
    loadingElement = document.getElementById('loadingElement');
  }
};

/**
 * Handle animation upon entry navigation logic
 * @function onRendered
 * @returns {void 0}
 */
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

/**
 * Handle loading animation between routes
 * @function whileWaiting
 * @returns {void 0}
 */
const whileWaiting = function () {
  ensureLoadingElement();
  if (!firstTime) {
    app.yieldClass.set('animated bounceOutLeft');
  }
  loadingElement.style.display = 'flex';
};

/**
 * Render templates upon navigation and handle animation timings logic
 * @function render
 * @returns {void 0}
 */
const render = (route, ...args) => {
  setTimeout(() => {
    route.render(...args, onRendered);
  }, 512);
};

/**
 * Shortcut object holding widely-used templates names
 * @type {object} templates
 */
const templates = {
  layout: 'layout'
};

export { render, whileWaiting, onRendered, ensureLoadingElement, templates };
