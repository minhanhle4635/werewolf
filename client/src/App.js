import { Fragment, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import setAuthToken from './utils/setAuthToken';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Alert from './components/layout/Alert';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Lobbies from './components/lobbies/Lobbies';
import LobbyForm from './components/lobbies/LobbyForm';
import Room from './components/room/Room';
import Game from './components/game/Game';
import Profile from './components/profile/Profile';
import EditProfile from './components/profile-form/EditProfile';
import homepage from './components/index/homepage';
import './App.css';

//Redux
import { Provider } from 'react-redux';
import store from './store';
import { loadUser } from './actions/auth';
import PrivateRoute from './components/routing/PrivateRoute';

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <Navbar />
          <section className="mt-12 bg-gray-100" style={sectionStyles}>
            <Route exact path="/" component={Landing} />
            <Alert />
            <Switch>
              <Route exact path="/register" component={Register} />
              <Route exact path="/login" component={Login} />

              <PrivateRoute exact path="/homepage" component={homepage} />
              <PrivateRoute exact path="/lobbies" component={Lobbies} />
              <PrivateRoute exact path="/create_room" component={LobbyForm} />
              <PrivateRoute exact path="/room/:id" component={Room} />
              <PrivateRoute exact path="/game/:id" component={Game} />
              <PrivateRoute
                exact
                path="/edit-profile"
                component={EditProfile}
              />
              <PrivateRoute exact path="/profile/:id" component={Profile} />
            </Switch>
          </section>
        </Fragment>
      </Router>
    </Provider>
  );
};

const sectionStyles = {
  height: 'calc(100vh - 3rem)',
};

export default App;
