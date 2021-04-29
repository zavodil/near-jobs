import { Meteor } from 'meteor/meteor';
import { Octokit } from 'octokit';
import { appOctokit } from '/imports/server/octokit/lib.js';

import { app } from '/server/main.js';

const profiles = {
  async upsert(user, form) {
    let body;
    if (form.type === 'candidate') {
      body = `- __GitHub Profile__: @${user.services.github.username}
- __Available for__:${form.availabilityText}
- __Categories__:${form.categoryText}
- __Location__: ${form.locationText}
- __Skills__:${form.skillsText}

${form.description}

---

*Want to hire ${form.title} (@${user.services.github.username})?*
Leave your offer below!`;
    } else {
      body = `- __GitHub Organization__: ${form.company ? `@${form.company.login}` : '`not-provided`'}

${form.description}

---

*Want to work at ${form.title}?*
Checkout their [open positions](https://github.com/${Meteor.settings.public.repo.org}/${Meteor.settings.public.repo.jobs}/labels/company%3A${app.slugify(form.title)})`;
    }

    const update = {
      title: form.title,
      owner: user._id,
      type: form.type,
      'user.login': user.services.github.username,
      tags: form.tags,
      body
    };

    const octokit = new Octokit({
      auth: user.services.github.accessToken
    });

    if (!form.issue) {
      try {
        const newIssue = await octokit.rest.issues.create({
          owner: Meteor.settings.public.repo.org,
          repo: Meteor.settings.public.repo.profiles,
          title: `${form.type === 'candidate' ? 'CV:' : 'Company:'} ${form.title}`,
          body
        });
        form.issue = {
          number: newIssue.data?.number
        };

        update['issue.number'] = newIssue.data?.number;
        update['issue.updated_at'] = +new Date(newIssue.data?.updated_at || 0);
      } catch (e) {
        console.error('[profiles.upsert] [octokit.rest.issues.create] Error:', e);
        throw new Meteor.Error(500, 'Server error occurred. Please, try again later');
      }
    } else {
      try {
        const updatedIssue = await octokit.rest.issues.update({
          owner: Meteor.settings.public.repo.org,
          repo: Meteor.settings.public.repo.profiles,
          issue_number: form.issue.number,
          title: `${form.type === 'candidate' ? 'CV:' : 'Company:'} ${form.title}`,
          state: 'open',
          body
        });
        update['issue.updated_at'] = +new Date(updatedIssue.data?.updated_at || 0);
      } catch (e) {
        console.error('[profiles.upsert] [octokit.rest.issues.update] Error:', e);
        throw new Meteor.Error(500, 'Server error occurred. Please, try again later');
      }
    }

    try {
      await appOctokit.rest.issues.addLabels({
        owner: Meteor.settings.public.repo.org,
        repo: Meteor.settings.public.repo.profiles,
        issue_number: form.issue.number,
        labels: form.tags
      });
    } catch (e) {
      console.error('[profiles.upsert] [appOctokit.rest.issues.addLabels] Error:', e);
      throw new Meteor.Error(500, 'Server error occurred. Please, try again later');
    }

    if (form.company) {
      update.company = form.company;
    }

    app.collections.profiles.upsert({
      _id: form._id,
    }, {
      $set: update
    });

    Meteor.users.update(user._id, {
      $set: {
        'profile.type': form.type,
        'profile.issue.number': form.issue.number
      }
    });

    return true;
  }
};

export { profiles };
