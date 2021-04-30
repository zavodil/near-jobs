# Jobs board for NEAR project

Jobs board website for NEAR project powered by GitHub issues

Stack:

- Node.js / Meteor.js
- MongoDB
- Jade / Blaze
- SASS
- PWA

## Functional description

- Repositories:
  1. `jobs` — Where issues are job posts only
  2. `profiles` — Where issues are either candidates or companies/projects
- Data entities:
  - Candidate (job seeker's page) - GitHub issue from `profiles` repository with `candidate` label
  - Company/Project - GitHub issue from `profiles` repository with `company` label
  - Job posts - GitHub issue from `jobs` repository with `job` label
  - Job response — GitHub issue' comment under issue at `jobs` repository with `job` label
  - Job offer — GitHub issue' comment under issue at `profiles` repository with `candidate` label
- Tags/Labels
  - `candidate`
  - `company`
  - `job`
  - Prefixed with `type:` are job type labels, e.g. `type:full-time`
  - Prefixed with `category:` are category type labels, e.g. `category:evangelist`
  - Prefixed with `skill:` are skills type labels, e.g. `skill:javascript`

## Pages

- Landing page
  - Search (fully featured text search)
    - Search through job posts
    - Search through candidates
    - Search through companies/projects
  - Latest jobs list
- Search results page
  - Search field
  - Filter options
  - List of search results
- Create new account/sign up
  - Login via GitHub
  - Select account type `['candidate', 'company']`
- Job post page
  - Description
  - Link: Apply to job
  - Link: Open company/project page
  - Tags
    - Type
    - Category
    - Required Skills
- Apply to a job page/form
- Post a job page/form
- Projects list page
  - List of companies/projects with title, short description, and link
  - Pagination
- Project/Company page
  - Description
  - List of open jobs posted under this project/company
- My profile page (Company/Project)
  - Company/Project description
  - Add/Update company/project description
  - Link to "my" jobs page (search page with filter by creator)
- My profile page (Candidate)
  - Candidate description
  - Add/Update candidate description
  - List of applied jobs

## UX (user story)

- Post a job
  a. Post an issue via Near `jobs` repository. It would get synced to the website
  b. Post a new job via the website form. It would get synced to GitHub issues
- Post candidate/CV
  a. Post an issue via Near `profiles` repository following "issue template," it would get synced to the website
  b. Fill candidate form via the website. It would get synced to GitHub issues
- Post project/company profile
  a. Post an issue via Near `profiles` repository following "issue template," it would get synced to the website
  b. Fill company form via the website. It would get synced to GitHub issues
- Apply for a job
  a. Post a comment under an issue at Near `jobs` repository
  b. Fill "apply for a job" form via the website. It would get posted as a comment under "job" issue at to GitHub `jobs` repository

When creating an issue via GitHub, we will use "issue template" to suggest the user follow the same template across all job posts and profiles. When creating the issue via website UI, all fields will be composed together following the same template across all job posts and profiles.

## Development stage instructions

This project is build on top of Meteor.js, Blaze, SASS, and Node.js

### Prerequisites

1. [Install meteor.js](https://www.meteor.com/developers/install)
2. Install NPM dependencies by executing `meteor npm install` within project's directory

### Running locally

To run project locally two environment variables are required `ACCOUNTS_GITHUB_ID` and `ACCOUNTS_GITHUB_SEC`:

```shell
ACCOUNTS_GITHUB_ID="xxx" ACCOUNTS_GITHUB_SEC="yyyyy" ROOT_URL="http://127.0.0.1:5555" meteor --port 5555
```

`ROOT_URL` variable and `--port` flag are optional.
