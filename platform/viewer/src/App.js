import { hot } from 'react-hot-loader/root';

import './config';

import {
  CommandsManager,
  ExtensionManager,
  HotkeysManager,
  utils,
} from '@ohif/core';
import React, { Component } from 'react';
import {
  getUserManagerForOpenIdConnectClient,
  initWebWorkers,
} from './utils/index.js';

import { I18nextProvider } from 'react-i18next';
import initCornerstoneTools from './initCornerstoneTools.js';

// ~~ EXTENSIONS
import { GenericViewerCommands, MeasurementsPanel } from './appExtensions';
import OHIFCornerstoneExtension from '@ohif/extension-cornerstone';
import OHIFStandaloneViewer from './OHIFStandaloneViewer';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { getActiveContexts } from './store/layout/selectors.js';
import i18n from '@ohif/i18n';
import setupTools from './setupTools.js';
import store from './store';

// Contexts
import WhiteLabellingContext from './context/WhiteLabellingContext';
import AppContext from './context/AppContext';
import './Login.css';

// ~~~~ APP SETUP
initCornerstoneTools({
  globalToolSyncEnabled: true,
  showSVGCursors: true,
});

const commandsManagerConfig = {
  getAppState: () => store.getState(),
  getActiveContexts: () => getActiveContexts(store.getState()),
};

const commandsManager = new CommandsManager(commandsManagerConfig);
const hotkeysManager = new HotkeysManager(commandsManager);
const extensionManager = new ExtensionManager({ commandsManager });

// CornerstoneTools and labeling/measurements?
setupTools(store);
// ~~~~ END APP SETUP

// TODO[react] Use a provider when the whole tree is React
window.store = store;

class App extends Component {
  static propTypes = {
    routerBasename: PropTypes.string.isRequired,
    servers: PropTypes.object.isRequired,
    //
    oidc: PropTypes.array,
    whiteLabelling: PropTypes.object,
    extensions: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
      })
    ),
  };

  static defaultProps = {
    whiteLabelling: {},
    oidc: [],
    extensions: [],
  };

  _appConfig;
  _userManager;

  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      redirectToReferrer: false,
    };
    this.login = this.login.bind(this);
    this.onChange = this.onChange.bind(this);

    this._appConfig = props;
    const { servers, extensions, hotkeys, oidc } = props;

    this.initUserManager(oidc);
    _initExtensions(extensions, hotkeys);
    _initServers(servers);
    initWebWorkers();
  }

  login() {
    if (this.state.email && this.state.password) {
      //Las URL del Cognito
      var Url = 'https://ws.mibluemedical.com:8443/oauth/v2/token';
      var BaseUrl = 'https://ws.mibluemedical.com:8443/shared/users/main/login';

      var myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

      var urlencoded = new URLSearchParams();
      urlencoded.append('client_id', '53a14205c80b1de3');
      urlencoded.append(
        'client_secret',
        '97b8063f23cfd74935c4f38bead307febc65fa724db93560e42f187ccb238560'
      );
      urlencoded.append('grant_type', 'client_credentials');
      urlencoded.append('scope', 'develop');

      var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
      };

      fetch(Url, requestOptions)
        .then(response => response.json())
        .then(token => {
          if (token.status == true) {
            //Body del API Login
            var StrData = {
              email: `${this.state.email}`,
              password: `${this.state.password}`,
            };

            //Headers del login
            var myHeaders = new Headers();

            myHeaders.append('Content-Type', 'application/json');
            myHeaders.append('Authorization', `bearer ${token.access_token}`);

            //Opciones de request
            var OpcionesEnvio = {
              method: 'POST',
              headers: myHeaders,
              body: JSON.stringify(StrData),
            };
            fetch(BaseUrl, OpcionesEnvio)
              .then(response => response.json())
              .then(Respuesta => {
                if (Respuesta.status == true) {
                  alert(`${Respuesta.message}`);
                  localStorage.setItem('userData', JSON.stringify(Respuesta));
                  this.setState({ redirectToReferrer: true });
                } else {
                  alert(`${Respuesta.message}`);
                }
              })
              .catch(error => console.log('error', error));
          } //fin del if
          else {
            console.log('parece que hubo un error');
          }
        })
        .catch(error => {
          console.log('hubo un error en APItoken:', error);
        });
    } //fin del if
    else {
      alert('llene los campos requeridos');
    }
  } //fin del login

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    const config = {
      appConfig: this._appConfig,
    };

    if (this.state.redirectToReferrer) {
      return (
        <AppContext.Provider value={config}>
          <Provider store={store}>
            <I18nextProvider i18n={i18n}>
              <Router basename={this.props.routerBasename}>
                <WhiteLabellingContext.Provider
                  value={this.props.whiteLabelling}
                >
                  <OHIFStandaloneViewer />
                </WhiteLabellingContext.Provider>
              </Router>
            </I18nextProvider>
          </Provider>
        </AppContext.Provider>
      );
    }

    if (localStorage.getItem('userData')) {
      return (
        <AppContext.Provider value={config}>
          <Provider store={store}>
            <I18nextProvider i18n={i18n}>
              <Router basename={this.props.routerBasename}>
                <WhiteLabellingContext.Provider
                  value={this.props.whiteLabelling}
                >
                  <OHIFStandaloneViewer />
                </WhiteLabellingContext.Provider>
              </Router>
            </I18nextProvider>
          </Provider>
        </AppContext.Provider>
      );
    }

    return (
      <div className="center" style={{ textAlign: 'center' }}>
        <div className="card">
          <img src="/assets/encabezado.png" height="50" />
          <h1>Iniciar Sesión</h1>
          <label>Ingresa tú correo electrónico</label>
          <br />
          <input
            className="form-item"
            placeholder="Coloque su correo..."
            name="email"
            type="email"
            onChange={this.onChange}
            required
          />
          <br />
          <label>Contraseña</label>
          <br />
          <input
            className="form-item"
            placeholder="Coloque su contraseña..."
            name="password"
            type="password"
            onChange={this.onChange}
          />
          <br />
          <input
            type="submit"
            className="form-submit"
            value="Inicar Sesión"
            onClick={this.login}
          />
        </div>
      </div>
    );
  }

  initUserManager(oidc) {
    if (oidc && !!oidc.length) {
      const firstOpenIdClient = this.props.oidc[0];

      const { protocol, host } = window.location;
      const { routerBasename } = this.props;
      const baseUri = `${protocol}//${host}${routerBasename}`;

      const redirect_uri = firstOpenIdClient.redirect_uri || '/callback';
      const silent_redirect_uri =
        firstOpenIdClient.silent_redirect_uri || '/silent-refresh.html';
      const post_logout_redirect_uri =
        firstOpenIdClient.post_logout_redirect_uri || '/';

      const openIdConnectConfiguration = Object.assign({}, firstOpenIdClient, {
        redirect_uri: _makeAbsoluteIfNecessary(redirect_uri, baseUri),
        silent_redirect_uri: _makeAbsoluteIfNecessary(
          silent_redirect_uri,
          baseUri
        ),
        post_logout_redirect_uri: _makeAbsoluteIfNecessary(
          post_logout_redirect_uri,
          baseUri
        ),
      });

      this._userManager = getUserManagerForOpenIdConnectClient(
        store,
        openIdConnectConfiguration
      );
    }
  }
}

/**
 * @param
 */
function _initExtensions(extensions, hotkeys) {
  const defaultExtensions = [
    GenericViewerCommands,
    MeasurementsPanel,
    OHIFCornerstoneExtension,
  ];
  const mergedExtensions = defaultExtensions.concat(extensions);
  extensionManager.registerExtensions(mergedExtensions);

  // Must run after extension commands are registered
  if (hotkeys) {
    hotkeysManager.setHotkeys(hotkeys, true);
  }
}

function _initServers(servers) {
  if (servers) {
    utils.addServers(servers, store);
  }
}

function _isAbsoluteUrl(url) {
  return url.includes('http://') || url.includes('https://');
}

function _makeAbsoluteIfNecessary(url, base_url) {
  if (_isAbsoluteUrl(url)) {
    return url;
  }

  // Make sure base_url and url are not duplicating slashes
  if (base_url[base_url.length - 1] === '/') {
    base_url = base_url.slice(0, base_url.length - 1);
  }

  return base_url + url;
}

// Only wrap/use hot if in dev
const ExportedApp = process.env.NODE_ENV === 'development' ? hot(App) : App;

export default ExportedApp;
export { commandsManager, extensionManager, hotkeysManager };
