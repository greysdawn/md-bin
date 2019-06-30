import React, {Component} from 'react';
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
    this.state = {user: undefined};
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Grey's MD Bin</h1>
          <a className="App-button" href="/create">Create</a>
        </header>
        <div className="App-container">
          <Router>
            <Route path="/" exact component={Index} />
            <Route path="/page/:id" exact render={(props)=><Page {...props}/>} />
            <Route path="/login" exact component={Login} />
            <Route path="/create" exact component={Create} />
            <Route path="/page/:id/edit" exact render={(props)=><Edit {...props}/>} />
            <Route path="/page/:id/delete" exact render={(props)=><Delete {...props}/>} />
            <Route path="/pages" exact component={Pages} />
          </Router>
        </div>
        <dv className="App-footer">
          <h1><a href="https://github.com/greysdawn/md-bin">source</a></h1>
        </dv>
      </div>
    );
  }
}

export default App;
