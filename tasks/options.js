const R = require('ramda');

class OptionsHandler {
  constructor($) {
    const self = this;
    this._env = R.omit(
      '_', R.path(['util', 'env'], $)
    );

    return new Proxy(this, {
      get(_, name) {
        return R.path(
          name.toString().split('.'),
          self._env
        );
      }
    });
  }
}

class OptionsHandlerSingletonFactory {
  constructor() {
    this.makeHandler = this.makeHandler.bind(this);
  }

  makeHandler($) {
    if (!this._$ && $) {
      this._$ = $;

      this._singleton = {};

      Object.defineProperty(this._singleton, 'instance', {
        get: () => new OptionsHandler(this._$)
      });

      Object.freeze(this._singleton);
    }

    return this._singleton.instance;
  }
}

module.exports = (new OptionsHandlerSingletonFactory()).makeHandler;
