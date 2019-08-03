import React, {Component, Fragment as Frag} from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import * as fetch from 'node-fetch';

import './App.css';

import Index from './components/index';
import Page from './components/page';
import Login from './components/login';
import Create from './components/create';
import Edit from './components/edit';
import Delete from './components/delete';
import Pages from './components/pages';

class App extends Component {
  constructor() {
    super();
    this.state = {user: undefined, check: false};
  }

  componentDidMount = async ()=> {
    var user;
    var pages;
    var dat = await fetch('/api/user');
    if(dat.status !=  401) user = await dat.json();
    else user = undefined;
    var dat = await fetch('/api/pages');
    if(dat.status == 200) pages = await dat.json();
    else pages = undefined;
    this.setState({user: user, pages: pages, check: true})
  }

  render() {
    if(!this.state.check) return null;
    else {
      return (
        <div className="App">
          <header className="App-header">
            <h1>Grey's MD Bin</h1>
            {this.state.user &&
              <Frag>
              <a className="App-button" href="/create">Create</a>
              <a className="App-button" href="/pages">Pages</a>
              </Frag>
            }
            {!this.state.user && <a className="App-button" href="/login">Log in</a>}
          </header>
          <div className="App-container">
            <Router>
              <Route path="/" exact component={Index} />
              <Route path="/page/:id" exact render={(props)=><Page {...props} user={this.state.user}/>} />
              <Route path="/login" exact component={Login} />
              <Route path="/create" exact render={(props)=><Create {...props} user={this.state.user} />} />
              <Route path="/page/:id/edit" exact render={(props)=><Edit {...props}/>} />
              <Route path="/page/:id/delete" exact render={(props)=><Delete {...props}/>} />
              <Route path="/pages" exact render={(props)=><Pages {...props} user={this.state.user} pages={this.state.pages}/>} />
            </Router>
          </div>
          <dv className="App-footer">
            <h1><a href="https://github.com/greysdawn/md-bin">source</a></h1>
          </dv>
        </div>
      );
    }
  }
}

export default App;
