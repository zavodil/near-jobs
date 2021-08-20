# Team Matching board for NEAR MetaBUIDL Global hackathon

Team Matching web service for NEAR MetaBUIDL powered by GitHub issues

Stack:

- Node.js / Meteor.js
- MongoDB
- Jade / Blaze
- SASS
- PWA

## Functional description

- Repositories:
  1. [`teams`](https://github.com/near/metabuidl-teams) — Where issues are teams posts only
  2. [`profiles`](https://github.com/near/metabuidl-profiles) — Where issues are either buidlers/creators or teams open positions

- Data entities:
  - Candidate (seeker's page) - GitHub issue from `profiles` repository with `candidate` label
  - Team/Project - GitHub issue from `profiles` repository with `company` label
  - Team Matching posts - GitHub issue from `teams` repository with `job` label
  - Job response — GitHub issue comment under issue at `teams` repository with `job` label
  - Job offer — GitHub issue comment under issue at `profiles` repository with `candidate` label
- Tags/Labels
  - `candidate`
  - `company`
  - `job`
  - Prefixed with `type:` are job type labels, e.g. `type:full-time`
  - Prefixed with `category:` are category type labels, e.g. `category:evangelist`
  - Prefixed with `skill:` are skills type labels, e.g. `skill:javascript`

When creating an issue via GitHub, we will use "issue template" to suggest the user follow the same template across all job posts and profiles. When creating the issue via website UI, all fields will be composed together following the same template across all job posts and profiles.

## Development stage instructions

This project is build on top of Meteor.js, Blaze, SASS, and Node.js

### Prerequisites

1. [Install meteor.js](https://www.meteor.com/developers/install)
2. Install NPM dependencies by executing `meteor npm install` within project's directory

### Running locally

To run project locally two environment variables are required 

- `ACCOUNTS_GITHUB_ID`
- `ACCOUNTS_GITHUB_SEC`
- `APP_GITHUB_ID`
- `APP_GITHUB_INSTALLATION`

```shell
ACCOUNTS_GITHUB_ID="xxx" ACCOUNTS_GITHUB_SEC="yyyyy" APP_GITHUB_ID="zzzz" APP_GITHUB_INSTALLATION="aaaa" ROOT_URL="http://127.0.0.1:5555" meteor --port 5555
```

`ROOT_URL` variable and `--port` flag are optional.

### Deploy script

1. Run [deploy.sh](https://github.com/veliovgroup/meteor-snippets/tree/main/devops#first-deploy)
