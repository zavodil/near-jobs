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

export { app };
