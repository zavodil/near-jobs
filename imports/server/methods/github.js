import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
// import { Octokit, App, Action } from 'octokit';
import { appOctokit } from '/imports/server/octokit/lib.js';

import { app } from '/server/main.js';

const freeFormFields = ['title', 'description'];

Meteor.methods({
  async 'github.issue.signup'(type, form) {
    check(type, Match.OneOf('candidate', 'company'));
    check(form, Object);

    const user = app.checkUser(this.userId);

    const upsert = {
      type,
      title: form.title,
      tags: [type]
    };

    const profile = app.collections.profiles.findOne({
      'user.login': user.services.github.username
    }, {
      fields: {
        _id: 1,
        'issue.number': 1
      }
    });

    if (!profile) {
      try {
        const issues = await appOctokit.rest.search.issuesAndPullRequests({
          q: `is:issue is:open author:${user.services.github.username} repo:${Meteor.settings.public.repo.org}/${Meteor.settings.public.repo.profiles}`,
          per_page: 1,
          page: 1
        });

        if (issues.data?.items?.[0]) {
          upsert.issue = {
            number: issues.data?.items?.[0]?.number
          };
        }
      } catch (e) {
        console.error('[github.issue.signup] [appOctokit.rest.search.issuesAndPullRequests] Error:', e);
      }
    } else if (profile.issue?.number) {
      upsert._id = profile._id;
      upsert.issue = {
        number: profile.issue.number
      };
    }

    for (const prop in form) {
      if (Array.isArray(form[prop])) {
        upsert[`${prop}Text`] = '';
        for (const _val of form[prop]) {
          const val = app.slugify(_val.trim());
          if (val && typeof val === 'string') {
            upsert.tags.push(`${prop}:${val}`);
            upsert[`${prop}Text`] += ` \`${val}\``;
          }
        }
      } else if (typeof form[prop] === 'string') {
        if (!freeFormFields.includes(prop)) {
          upsert[prop] = app.slugify(form[prop].trim());
        } else if (prop === 'username') {
          upsert.username = form.username.startsWith.startsWith('@') ? form.username.substr(1).trim() : form.username.trim();
        } else {
          upsert[prop] = form[prop].trim();
        }
      }
    }

    if (type === 'company') {
      if (upsert.username) {
        try {
          const companies = await appOctokit.rest.search.users({
            q: `org:${upsert.username} type:users`,
            per_page: 1,
            page: 1
          });

          if (companies.data?.items?.[0]) {
            upsert.company = {
              id: companies.data?.items?.[0].id,
              login: companies.data?.items?.[0].login
            };
          } else {
            return {
              errorFields: {
                username: 'Organization not found on GitHub'
              }
            };
          }
        } catch (e) {
          console.error('[github.issue.signup] [appOctokit.rest.search.users] Error:', e);
        }
      }
    } else {
      if (form.remote === 'yes') {
        upsert.tags.push('remote');
        if (!form.country && !form.city) {
          upsert.location = '`remote`';
        }
      }

      let location;
      if (form.country && form.city) {
        location = `${app.slugify(form.country.trim())}:${app.slugify(form.city.trim())}`;
      } else if (form.country && !form.city) {
        location = app.slugify(form.country.trim());
      } else if (!form.country && form.city) {
        return {
          errorFields: {
            country: 'Country is required when City is filled-out'
          }
        };
      }

      if (location) {
        upsert.tags.push(location);
        upsert.locationText = `\`${location}\``;
      }
    }

    app.profiles.upsert(user, upsert);
    return true;
  }
});
