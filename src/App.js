import React from 'react';

import './App.css';
import CreateWallet from './pages/create-wallet'
import ImportWallet from './pages/import-wallet'
import Signin from './pages/signin'
import Home from './pages/home'
import AboutUs from './pages/about-us'
import Send from './pages/send'
import Receive from './pages/receive'
import TransactionDetail from './pages/transaction-details';
import WalletDetail from './pages/wallet-details';
import ExportKey from './pages/export-key';
import AddCustomToken from './pages/add-token';
import DeployContract from './pages/deploy-contract';

import { useRecoilState } from 'recoil';
import { allTokens, currentWallet } from './store/atoms';

import {
  MemoryRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Settings from './pages/settings';
import ALL_TOKENS from './config/tokens';

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(',')
  },
  palette: {
    primary: {
      main: '#184c82'
    },
    secondary: {
      main: '#2196f3'
    }
  }
});

function App() {

  const [currentTokens, setCurrentTokens] = useRecoilState(allTokens);

  React.useEffect(() => {
    if(currentTokens.length === 0) {
      setCurrentTokens(ALL_TOKENS);
    }
  }, [currentTokens]); //eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ThemeProvider theme={theme}>
      <ProvideAuth>
          <Router>
            <Switch>
              <PrivateRoute path="/about-us">
                <AboutUs />
              </PrivateRoute>
              <PrivateRoute path="/send">
                <Send />
              </PrivateRoute>
              <PrivateRoute path="/settings">
                <Settings />
              </PrivateRoute>
              <Route path="/receive">
                <Receive />
              </Route>
              <PrivateRoute path="/export-key">
                <ExportKey />
              </PrivateRoute>
              <PrivateRoute path="/add-token">
                <AddCustomToken />
              </PrivateRoute>
              <PrivateRoute path="/home">
                <Home />
              </PrivateRoute>
              <PrivateRoute path="/deploy-contract">
                <DeployContract />
              </PrivateRoute>
              <Route path="/transaction/:hash" component={TransactionDetail}>
              </Route>
              <PrivateRoute path="/wallet/:address/:index" component={WalletDetail}>
              </PrivateRoute>
              <Route path="/create-wallet">
                <CreateWallet />
              </Route>
              <Route path="/import-wallet">
                <ImportWallet />
              </Route>
              <Route path="/signin">
                <Signin />
              </Route>
              <Route exact path="/">
                <Redirect to="/home" />
              </Route>
            </Switch>
          </Router>
        </ProvideAuth>
    </ThemeProvider>
  );
}

/** For more details on
 * `AuthContext`, `ProvideAuth`, `useAuth` and `useProvideAuth`
 * refer to: https://usehooks.com/useAuth/
 */
const AuthContext = React.createContext();

function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

function useProvideAuth() {

  const [walletAtom] = useRecoilState(currentWallet);
  const [loggedIn, setLoggedIn] = React.useState(false);

  React.useEffect(() => {
    if(walletAtom && walletAtom.address && walletAtom.password && walletAtom.keystore) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, [walletAtom]);

  return {
    loggedIn
  };
}

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
function PrivateRoute({ children, ...rest }) {
  let auth = React.useContext(AuthContext);
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth.loggedIn ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/signin",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}

export default App;
