"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = createHubMiddleware;

var _invariant = require("invariant");

var _invariant2 = _interopRequireDefault(_invariant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var wrapAction = function wrapAction(action) {
    return _extends({}, action, { __hubOriginated: true });
};

var isActionHubOriginated = function isActionHubOriginated(action) {
    return !!action.__hubOriginated;
};

var unwrapAction = function unwrapAction(action) {
    var __hubOriginated = action.__hubOriginated,
        rest = _objectWithoutProperties(action, ["__hubOriginated"]);

    return rest;
};

function createHubMiddleware() {
    var connectedStores = [];

    var connect = function connect(store) {
        return connectedStores.push(store);
    };

    var middleware = function middleware(store) {
        return function (next) {
            return function (action) {
                if (connectedStores.length < 2) {
                    return next(action);
                }

                if (isActionHubOriginated(action)) {
                    return next(unwrapAction(action));
                }

                var index = connectedStores.findIndex(function (connectedStore) {
                    return store.getState === connectedStore.getState;
                });

                (0, _invariant2.default)(index !== -1, "This store is not connected to hub, but hub middleware is used in it");

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
