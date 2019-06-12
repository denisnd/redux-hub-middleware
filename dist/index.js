'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = createReduxHub;

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var wrapAction = function wrapAction(action) {
  return _extends({}, action, { __hubOriginated: true });
};

var isActionHubOriginated = function isActionHubOriginated(action) {
  return !!action.__hubOriginated;
};

var unwrapAction = function unwrapAction(action) {
  var __hubOriginated = action.__hubOriginated,
      rest = _objectWithoutProperties(action, ['__hubOriginated']);

  return rest;
};

var invariant = function invariant(condition, message) {
  if (!condition) {
    var error = new Error();

    error.name = 'Invariant violation';
    error.message = message;

    throw error;
  }
};

/**
 * Returns new Hub instance
 *
 * @return {{connect: (function(object)), middleware: function}}
 */
function createReduxHub() {
  var connectedStores = [];

  var connect = function connect(store) {
    return connectedStores.push(store);
  };

  var middleware = function middleware(store) {
    return function (next) {
      return function (action) {
        /* handling async and middlewares like redux-thunk */
        if ((typeof action === 'undefined' ? 'undefined' : _typeof(action)) !== 'object' || !action.type) {
          return next(action);
        }

        if (connectedStores.length < 2) {
          return next(action);
        }

        if (isActionHubOriginated(action)) {
          return next(unwrapAction(action));
        }

        var index = connectedStores.findIndex(function (connectedStore) {
          return store.getState === connectedStore.getState;
        });

        invariant(index !== -1, "This store is not connected to a hub, but hub middleware is used in it");

        var result = next(action);

        connectedStores.forEach(function (connectedStore, storeIndex) {
          if (storeIndex === index) return;
          connectedStore.dispatch(wrapAction(action));
        });

        return result;
      };
    };
  };

  return {
    connect: connect,
    middleware: middleware
  };
}
