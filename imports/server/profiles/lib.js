import { Meteor } from 'meteor/meteor';
import { Octokit } from 'octokit';
import { appOctokit } from '/imports/server/octokit/lib.js';
import { profiles as profilesCollection } from '/imports/lib/collections/profiles.collection.js';

import { app } from '/server/main.js';

const profiles = {
  async upsert(user, form) {
    let newTags = app.clone(form.tags);
    let removedTags = [];
    let body = app.clone(form.description);

    if (form.type === 'candidate') {
      body = `- __GitHub Profile__: @${user.services.github.username}
- __Available for__:${form.availabilityText}
- __Categories__:${form.categoryText}
- __Location__: ${form.locationText}
- __Skills__:${form.skillsText}`;
    } else {
      body = `- __GitHub Organization__: ${form.company ? `@${form.company.login}` : '`not-provided`'}`;
    }

    if (form.isUpdate) {
      if (form.type === 'candidate') {
        body += `
- [__Profile Page__](${Meteor.absoluteUrl(`/profile/${form.issue.number}`)})`;
      } else {
        body += `
- [__Company Profile__](${Meteor.absoluteUrl(`/profile/${form.issue.number}`)})
- [__Open Jobs__](${Meteor.absoluteUrl(`/profile/${form.issue.number}/jobs`)})`;
      }
    }

    body += `

${form.description}`;

    const update = {
      $set: {
        title: form.title,
        owner: user._id,
        type: form.type,
        'user.id': user.services.github.id,
        'user.login': user.services.github.username,
        tags: form.tags,
        body: form.description,
        'issue.state': 'open'
      }
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
          number: newIssue.data.number
        };

        update.$set['issue.number'] = newIssue.data.number;
        update.$set['issue.updated_at'] = +new Date(newIssue.data.updated_at);
      } catch (e) {
        console.error('[profiles.upsert] [octokit.rest.issues.create] Error:', e);
        throw new Meteor.Error(500, 'Server error occurred. Please, try again later');
      }
    } else {
      if (form.existingTags && form.existingTags.length > 0) {
        newTags = form.tags.filter(x => !form.existingTags.includes(x));
        removedTags = form.existingTags.filter(x => !form.tags.includes(x));

        if (removedTags.length === 1) {
          // REMOVE SINGLE LABEL
          try {
            await appOctokit.rest.issues.removeLabel({
              owner: Meteor.settings.public.repo.org,
              repo: Meteor.settings.public.repo.profiles,
              issue_number: form.issue.number,
              name: removedTags[0]
            });
          } catch (e) {
            console.error('[profiles.upsert] [octokit.rest.issues.removeLabel] Error:', e);
            throw new Meteor.Error(500, 'Server error occurred. Please, try again later');
          }
        } else if (removedTags.length > 1) {
          // REMOVE ALL LABELS AS THERE IS NO removeLabels METHOD
          // AND WE ARE LIMITED TO 30 REQUEST PER MINUTE
          // SO IT'S CHEAPER TO REMOVE ALL LABELS IN CASE IF ANY WAS REMOVED
          try {
            await appOctokit.rest.issues.removeAllLabels({
              owner: Meteor.settings.public.repo.org,
              repo: Meteor.settings.public.repo.profiles,
              issue_number: form.issue.number
            });
          } catch (e) {
            console.error('[profiles.upsert] [octokit.rest.issues.removeAllLabels] Error:', e);
            throw new Meteor.Error(500, 'Server error occurred. Please, try again later');
          }

          for (const tag of form.existingTags) {
            if (!removedTags.includes(tag)) {
              newTags.push(tag);
            }
          }
        }
      }

      newTags = app.uniq(newTags);

      // UPDATE ISSUE
      try {
        const updatedIssue = await octokit.rest.issues.update({
          owner: Meteor.settings.public.repo.org,
          repo: Meteor.settings.public.repo.profiles,
          issue_number: form.issue.number,
          title: `${form.type === 'candidate' ? 'CV:' : 'Company:'} ${form.title}`,
          state: 'open', // <-- REOPEN IF CLOSED
          body
        });

        update.$set['issue.number'] = form.issue.number;
        update.$set['issue.updated_at'] = +new Date(updatedIssue.data?.updated_at || 0);
      } catch (e) {
        console.error('[profiles.upsert] [octokit.rest.issues.update] Error:', e);
        throw new Meteor.Error(e.status || 500, 'Server error occurred. Please, try again later');
      }
    }

    if (newTags && newTags.length) {
      // ADD NEW LABELS
      try {
        await appOctokit.rest.issues.addLabels({
          owner: Meteor.settings.public.repo.org,
          repo: Meteor.settings.public.repo.profiles,
          issue_number: form.issue.number,
          labels: newTags
        });
      } catch (e) {
        console.error('[profiles.upsert] [appOctokit.rest.issues.addLabels] Error:', e);
        throw new Meteor.Error(500, 'Server error occurred. Please, try again later');
      }
    }

    if (form.company) {
      update.$set.company = form.company;
      update.$unset = {
        location: '',
        isRemote: '',
        availability: '',
        category: '',
        skills: '',
      };
    } else {
      update.$set.location = form.location;
      update.$set.isRemote = form.isRemote;
      update.$set.availability = form.availability;
      update.$set.category = form.category;
      update.$set.skills = form.skills;
      update.$unset = {
        company: ''
      };
    }

    profilesCollection.upsert({
      _id: form._id,
    }, update);

    Meteor.users.update(user._id, {
      $set: {
        'profile.type': form.type,
        'profile.issue.number': form.issue.number,
        'profile.issue.state': 'open'
      }
    });

    return true;
  },
  async close(user) {
    const octokit = new Octokit({
      auth: user.services.github.accessToken
    });

    try {
      await octokit.rest.issues.update({
        owner: Meteor.settings.public.repo.org,
        repo: Meteor.settings.public.repo.profiles,
        issue_number: user.profile.issue.number,
        state: 'closed'
      });
    } catch (e) {
      console.error('[profiles.close] [octokit.rest.issues.update] Error:', e);
      throw new Meteor.Error(e.status || 500, 'Server error occurred. Please, try again later');
    }

    app.jobs.closeAll(user);

    Meteor.users.update(user._id, {
      $set: {
        'profile.issue.state': 'closed'
      }
    });

    profilesCollection.update({
      owner: user._id
    }, {
      $set: {
        'issue.state': 'closed'
      }
    });

    return true;
  },
  async reopen(user) {
    const octokit = new Octokit({
      auth: user.services.github.accessToken
    });

    try {
      await octokit.rest.issues.update({
        owner: Meteor.settings.public.repo.org,
        repo: Meteor.settings.public.repo.profiles,
        issue_number: user.profile.issue.number,
        state: 'open'
      });
    } catch (e) {
      console.error('[profiles.reopen] [octokit.rest.issues.update] Error:', e);
      throw new Meteor.Error(e.status || 500, 'Server error occurred. Please, try again later');
    }

    Meteor.users.update(user._id, {
      $set: {
        'profile.issue.state': 'open'
      }
    });

    profilesCollection.update({
      owner: user._id
    }, {
      $set: {
        'issue.state': 'open'
      }
    });

    return true;
  }
};

export { profiles };
