import React, { Component, Fragment as Frag } from 'react';
import * as fetch from 'node-fetch';

import Login from './login';

class Delete extends Component {
	constructor(props) {
		super(props);
		this.state = {
						loggedin: false,
						id: this.props.match.params.id,
						result: undefined
					}
	}

	async componentDidMount() {
		var us = await fetch('/api/user');
		var logged;
		var dat;
		if(us.status == 200) {
			logged = true;
		} else {
			logged = false;
		}

		var del = await fetch(`/api/page/${this.state.id}/delete`);
		if(del.status == 200) {
			dat = true
		} else {
			dat = false
		}

		this.setState({loggedin: logged, result: dat});
	}

	render() {
		if(!this.state.loggedin) {
			return (
				<div className="App-login">
				<h1>Please log in first</h1>
				<Login />
				</div>
			);
		} else if(this.state.loggedin && this.state.result) {
			console.log(this.state.page)
			return(
				<section>
				<p>Page deleted!</p>
				</section>
			);
		} else if(this.state.result==false) {
			return (
				<section>
				<p>Page could not be deleted.</p>
				</section>
			)
		} else {
			return (
				<section>
				<p>Something went wrong</p>
				</section>
			)
		}
	}
}

export default Delete;