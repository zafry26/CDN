// Import polyfills.
import "core-js/stable";
import "custom-event-polyfill";
import "event-source-polyfill";

// Import global styles.
import "bootstrap/dist/css/bootstrap.min.css";
import "@Styles/main.scss";
import "@Styles/loaders/queryLoader.scss";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "boxicons/css/boxicons.min.css";
import "aos/dist/aos.css";
import "remixicon/fonts/remixicon.css";
import "glightbox/dist/css/glightbox.min.css";

// Other imports.
import * as React from "react";
import * as ReactDOM from "react-dom";
import configureStore from "@Store/configureStore";
import SessionManager, {tokenKey} from "@Core/session";
import { AppContainer } from "react-hot-loader";
import { Provider } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import { createBrowserHistory } from "history";
import { isNode, showApplicationLoader, hideApplicationLoader} from "@Utils";
import { hideStandOutLoader, onPageLoad } from "@WebCastUtils";
import * as RoutesModule from "./routes";
import {PoppersInstance} from "@Libs/index";
let routes = RoutesModule.routes;
import { PortfolioIsotopeFilter, GLightboxLoad } from "@Libs/portfolioDetail";

function setupSession() {
    if (!isNode()) {
        SessionManager.resetSession();
        SessionManager.initSession({
            token:"",
            refreshToken: ""
        });
    }
};

function setupGlobalPlugins() {
    // Use this function to configure plugins on the client side.
   
    //GLightboxLoad();
};

function setupEvents() {
    showApplicationLoader();
    onPageLoad();

    document.addEventListener("DOMContentLoaded", () => {
        hideStandOutLoader();
        hideApplicationLoader();
        PoppersInstance();
        PortfolioIsotopeFilter();
        GLightboxLoad();
    });
};

function getBaseUrl() {
    var elements = document.getElementsByTagName('base');
    if (elements.length === 0) {
        return null;
    }
    return elements[0].getAttribute('href');
}

// Create browser history to use in the Redux store.
const baseUrl = getBaseUrl();
const history = createBrowserHistory({ basename: baseUrl });

// Get the application-wide store instance, prepopulating with state from the server where available.
const initialState = window.initialReduxState;
const store = configureStore(history, initialState);

function renderApp() {
    // This code starts up the React app when it runs in a browser. 
    // It sets up the routing configuration and injects the app into a DOM element.
    ReactDOM.hydrate(
        <AppContainer>
            <Provider store={ store }>
                <ConnectedRouter history={ history } children={ routes } />
            </Provider>
        </AppContainer>,
        document.getElementById("react-app")
    );
}

// Setup the application and render it.]
setupSession();
setupGlobalPlugins();
setupEvents();
renderApp();

// Allow Hot Module Replacement.
if (module.hot) {
    module.hot.accept("./routes", () => {
        routes = require("./routes").routes;
        renderApp();
    });
}