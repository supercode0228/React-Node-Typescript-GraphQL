# React Node Typescript GraphQL

Such amaze! :nerd_face:

## Development

### Setup

1.  Install project dependencies:

        yarn install

2.  Populate database with test data (optional):

        yarn seed

3.  Add environment variables to a `.env` file in the root of the project (contact [Tester](mailto:tester@tests.com) to get the credentials):

        ACTIVECAMPAIGN_ACCOUNT=YOUR-ACCOUNT
        ACTIVECAMPAIGN_KEY=YOUR-KEY
        ACTIVECAMPAIGN_TRACK_ACTID=YOUR-TRACK-ACTID
        ACTIVECAMPAIGN_TRACK_KEY=YOUR-TRACK-KEY

        GOOGLE_API_KEY=YOUR-GOOGLE-API-KEY

4.  Start the server:

        yarn dev

### Test

We're using [Jest](https://jestjs.io) as our testing framework.

To run all tests, issue the following command:

    yarn jest

## Deployment

Configured to GitLab's CI/CD. See [.gitlab-ci.yml](.gitlab-ci.yml) for more information.

## Docs

- [GraphQL schema](server/core/graphql/schema.gql)
