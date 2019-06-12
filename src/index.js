import invariant from "invariant";

const wrapAction = action => ({ ...action, __hubOriginated: true });

const isActionHubOriginated = action => !!action.__hubOriginated;

const unwrapAction = action => {
    const { __hubOriginated, ...rest } = action;
    return rest;
};

export default function createReduxHub() {
    const connectedStores = [];

    const connect = store => connectedStores.push(store);

    const middleware = store => next => action => {
        if (connectedStores.length < 2) {
            return next(action);
        }

        if (isActionHubOriginated(action)) {
            return next(unwrapAction(action));
        }

        const index = connectedStores.findIndex(
            connectedStore => store.getState === connectedStore.getState
        );

        invariant(
            index !== -1,
            "This store is not connected to a hub, but hub middleware is used in it"
        );

        const result = next(action);

        connectedStores.forEach((connectedStore, storeIndex) => {
            if (storeIndex === index) return;
            connectedStore.dispatch(wrapAction(action));
        });

        return result;
    };

    return {
        connect,
        middleware
    };
}
