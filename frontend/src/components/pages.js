import React, { Component, Fragment as Frag } from 'react';
import * as fetch from 'node-fetch';

import Login from './login';

class Pages extends Component {
	constructor() {
		super();
		this.state = {
						loggedin: false,
						pages: undefined
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

		var pages = await fetch(`/api/pages`);
		if(pages.status == 200) {
			dat = await pages.json();
		} else {
			dat = undefined
		}

		this.setState({loggedin: logged, pages: dat});
	}

	render() {
		if(!this.state.loggedin) {
			return (
				<div className="App-login">
				<h1>Please log in first</h1>
				<Login />
				</div>
			);
		} else if(this.state.loggedin && this.state.pages) {
			return(
				<div className="App-pages">
				<h1>Pages</h1>
				{this.state.pages.map((p,i)=> {
					return (
						<div className="App-pageEntry">
							<a className="App-pageButton" href={"/page/"+p.id}>{p.title}</a>
							<a className="App-button" href={`/page/${p.id}/edit`}>edit</a>
							<a className="App-button" href={`/page/${p.id}/delete`}>delete</a>
						</div>
					);
				})}
				</div>
			);
		} else {
			return (
				<section>
				<p>Something went wrong</p>
				</section>
			)
		}
	}
}

export default Pages;