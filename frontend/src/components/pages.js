import React, { Component, Fragment as Frag } from 'react';
import * as fetch from 'node-fetch';

import Login from './login';

class Pages extends Component {
	constructor(props) {
		super(props);
		this.state = {
						user: this.props.user,
						pages: this.props.pages
					}
	}

	render() {
		if(!this.state.user) {
			return (
				<p>Please log in first.</p>
			);
		} else if(this.state.user && this.state.pages) {
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