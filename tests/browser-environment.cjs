const { TestEnvironment } = require('jest-environment-jsdom');
const { TextEncoder, TextDecoder } = require('node:util');

// JSDOM provides forms and DOM; Node provides the native Fetch API used by the client.
module.exports = class BrowserEnvironment extends TestEnvironment {
  constructor(config, context) {
    super(config, context);
    Object.assign(this.global, {
      TextEncoder,
      TextDecoder,
      fetch: globalThis.fetch,
      Headers: globalThis.Headers,
      Request: globalThis.Request,
      Response: globalThis.Response,
    });
  }
};
