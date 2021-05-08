import { app } from '/imports/lib/app.js';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { ReactiveVar } from 'meteor/reactive-var';
import '/imports/client/router/router.js';

/*
 * Method used to get canonical URL of the currently open route
 *
 * @namespace app
 * @method currentUrl
 * @returns {string} - FQDN canonical URL
 */
app.currentUrl = () => {
  return Meteor.absoluteUrl((FlowRouter.current().path || document.location.pathname).replace(/^\//g, '')).split('?')[0].split('#')[0].replace('!', '');
};

/*
 * Method used to run logic after template is fully loaded
 * and method/subscription data is fully propagated.
 * Set `IS_RENDERED`` to `true`` for pre-rendering engine.
 * template callback, like Template#onRendered(app.isReady);
 *
 * @namespace app
 * @method isReady
 * @returns {void 0}
 */
app.isReady = function () {
  let tracker;
  tracker = this.autorun(() => {
    if (window.IS_PRERENDERING) {
      if (this.subscriptionsReady()) {
        setTimeout(() => {
          window.IS_RENDERED = true;
        }, 512);
      }
    } else {
      if (this.subscriptionsReady() && !Meteor.loggingIn()) {
        tracker?.stop();
      }

      window.IS_RENDERED = true;
    }
  });
};

/*
 * Array of strings with private routes, used to display login form while user isn't authorized
 *
 * @namespace app
 * @property privateRoutes {[string]} - Array of string
 */
app.privateRoutes = [];

/*
 * Dynamic classes used by Blaze and Router to trigger enter/exit animation
 *
 * @namespace app
 * @instanceOf ReactiveVar
 * @property yieldClass {ReactiveVar} - class(-es) used on .yiled DOM element
 */
app.yieldClass = new ReactiveVar('animated outOfView');

/*
 * Detect small screens
 *
 * @namespace app
 * @property isSmall {Boolean}
 */
app.isSmall = ((document.documentElement.clientWidth || document.body.clientWidth) < 768);

/*
 * Check form fields errors, and put together form object
 *
 * @namespace app
 * @method processFormElements
 * @param {[HTMLElement]} elements - Array of DOM HTMLElement(s), usually select, input, textarea, etc.
 * @returns { form: Object, errorFields: Object }
 */
app.processFormElements = (elements) => {
  const form = {};
  const errorFields = {};

  for (const element of elements) {
    if (element.hasAttribute('required') && element.value.length < 2) {
      errorFields[element.id] = 'This field is required';
    } else if (element.dataset.maxOptions && element.value.split(',').length > parseInt(element.dataset.maxOptions)) {
      errorFields[element.id] = `Options limit exceeded, enter up to ${element.dataset.maxOptions} options`;
    } else if (element.hasAttribute('maxlength') && element.value.length > parseInt(element.getAttribute('maxlength'))) {
      errorFields[element.id] = `Entered value is too long, this field length limit is ${element.getAttribute('maxlength')}`;
    } else {
      if (element.dataset.maxOptions) {
        form[element.name] = element.value.split(',').map(val => app.slugify(val));
      } else {
        form[element.name] = element.value.trim();
      }
    }
  }

  return { form, errorFields };
};

/*
 * Update comma-separated array-like HTML input value
 *
 * @namespace app
 * @method addToInput
 * @param {DOMEvent} e - DOMEvent from Blaze template event
 * @param {Blaze.TemplateInstance} template - Template (2nd argument from Blaze template event)
 * @returns {Boolean}
 */
app.addToInput = (e, template) => {
  const input = template.find(`#${e.currentTarget.dataset.addTo}`);
  if (!input) {
    return false;
  }

  const noTransform = !!input.dataset.noTransform;
  const replace = !!input.dataset.replace;

  let values = [];
  if (!replace) {
    values = input.value.split(',').map(val => val.trim()).filter(val => typeof val === 'string' && val.length > 0 && val.length <= 20).map(val => app.slugify(val));
  }
  const maxOptions = parseInt(input.dataset.maxOptions);
  const newEntry = e.currentTarget.dataset.add;
  const newEntrySlug = app.slugify(newEntry);

  if (input.value.includes(newEntry) || input.value.includes(newEntrySlug) || values.length >= maxOptions) {
    return false;
  }

  if (!noTransform) {
    values.push(newEntrySlug);
  } else {
    values.push(newEntry);
  }

  if (!replace) {
    input.value = values.join(', ');
  } else {
    input.value = values[0];
  }

  template.hasChanges.set(true);
  return false;
};

export { app };
