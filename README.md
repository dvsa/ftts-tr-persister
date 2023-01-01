# Test Results Persister

Retrieves configured number of messages from the queue

## Creating the local.settings.json

For this component, we use a `local.settings.json` file to store all environment variables to run the project locally.

You can create this file by running `npm run copy-config`

Locally `CRM_CLIENT_ID` and `CRM_CLIENT_SECRET` are required for CRM authentication. `USER_ASSIGNED_ENTITY_CLIENT_ID` is not needed (only used deployed).

## Building the project

Install node modules

```bash
npm install
```

Run the build process

```bash
npm run build
```

## Running the project locally

- Run `npm run copy-config` and fill in the missing configuration in your local.settings.json. Set connection strings as below, pointing to deployed/local storage.
- Run `npm start`. Running this start script triggers the `prestart` script which will automatically run the build process. The function will start on port `7074` by default. This can be configured within the `package.json` directly via the script.
- The function will run as per the cron schedule specified. Or you can invoke the function manually via HTTP as explained below.

### Debugging

Debug locally using the `.vscode/launch.json` 'Attach to Node Functions' config. Note the function will run on the default port `7071`.

## Tests

All tests can be found in the `tests` folder.

To run all tests:

```bash
npm test
```

To run the tests in watch mode:

```bash
npm run test:watch
```

To run test coverage:

```bash
npm run test:coverage
```

See the generated coverage report in the `coverage` folder created after running the tests.

## Linter

We use custom lint rules with `eslint` to enforce coding style for this project.

To run the linter:

```bash
npm run lint
```

To run the lint and fix any issues that can be resolved automatically:

```bash
npm run lint:fix
```