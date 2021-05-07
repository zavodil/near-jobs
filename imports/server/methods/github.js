import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { appOctokit } from '/imports/server/octokit/lib.js';
import { profiles as profilesCollection } from '/imports/lib/collections/profiles.collection.js';

import { app } from '/server/main.js';

const freeFormFields = ['title', 'description'];

Meteor.methods({
  async 'github.issue.profile'(type, form) {
    check(type, Match.OneOf('candidate', 'company'));
    check(form, Object);

    const user = app.checkUser(this.userId);

    const formData = {
      type,
      title: form.title,
      isUpdate: form.isUpdate || false,
      ...app.parseForm(form, freeFormFields)
    };

    formData.tags.push(type);

    const profile = profilesCollection.findOne({
      'user.login': user.services.github.username
    }, {
      fields: {
        _id: 1,
        tags: 1,
        'issue.number': 1
      }
    });

    if (profile) {
      formData._id = profile._id;
      formData.existingTags = profile.tags;
    }

    if (!profile || !profile?.issue?.number) {
      try {
        const issues = await appOctokit.rest.search.issuesAndPullRequests({
          q: `is:issue author:${user.services.github.username} repo:${Meteor.settings.public.repo.org}/${Meteor.settings.public.repo.profiles}`,
          sort: 'created',
          order: 'asc',
          per_page: 1,
          page: 1
        });

        if (issues.data?.items?.[0]) {
          formData.issue = {
            number: issues.data.items.[0].number
          };

          if (!formData.existingTags) {
            formData.existingTags = [];
          }

          for (const label of issues.data.items[0].labels) {
            formData.existingTags.push(label.name);
          }

          formData.existingTags = app.uniq(formData.existingTags);
        }
      } catch (e) {
        console.error('[github.issue.profile] [appOctokit.rest.search.issuesAndPullRequests] Error:', e);
      }
    } else {
      formData.issue = {
        number: profile.issue.number
      };
    }

    if (type === 'company') {
      if (formData.username) {
        try {
          const companies = await appOctokit.rest.search.users({
            q: `org:${formData.username} type:users`,
            per_page: 1,
            page: 1
          });

          if (companies.data?.items?.[0]) {
            formData.company = {
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
          console.error('[github.issue.profile] [appOctokit.rest.search.users] Error:', e);
        }
      }
    } else {
      if (form.remote === 'yes') {
        formData.tags.push('remote');
        formData.isRemote = true;
      } else {
        formData.isRemote = false;
      }

      formData.location = {
        country: form.country,
        city: form.city
      };

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
        formData.tags.push(location);
        formData.locationText = `\`${location}\``;
      }
    }

    formData.tags = app.uniq(formData.tags);

    await app.profiles.upsert(user, formData);
    return true;
  },
  async 'github.issue.profile.close'() {
    const user = app.checkUser(this.userId);
    await app.profiles.close(user);
    return true;
  },
  async 'github.issue.profile.reopen'() {
    const user = app.checkUser(this.userId);
    await app.profiles.reopen(user);
    return true;
  }
});
