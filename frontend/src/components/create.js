import React, { Component, Fragment as Frag } from 'react';
import * as fetch from 'node-fetch';
import * as showdown from 'showdown';
import * as sanitize from 'sanitize-html';

import Login from './login';

showdown.setOption('simplifiedAutoLink', true);
showdown.setOption('simpleLineBreaks', true);
showdown.setOption('openLinksInNewWindow', true);
showdown.setOption('underline', true);
showdown.setOption('tables', true);
showdown.setOption('strikethrough', true);
showdown.setOption('tasklists', true);

const conv = new showdown.Converter();

class Create extends Component {
	constructor(props) {
		super(props);
		this.state = {
						title: "title",
						body: "body",
						submitted: false,
						user: this.props.user,
						page: undefined
					}

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(name, e) {
		const n = name;
		const val = e.target.value;
		this.setState((state) => {
			if(n == "body") {
				state['nbody'] = sanitize(conv.makeHtml(val), {
									allowedTags: sanitize.defaults.allowedTags.concat([ 
										'img',
										'h1',
										'h2',
										'u',
										'del'
									])
								});
			}
			state[n] = val;
			return state;
		})
	}

	async handleSubmit(e) {
		e.preventDefault();
		var st = this.state;
		var page;

		var res = await fetch('/api/page', {
			method: "POST",
			body: JSON.stringify(st),
			headers: {
				"Content-Type": "application/json"
			}
		});

		if(res.status == 200) {
			page = await res.json();
			this.setState({submitted: true, page: page});
			this.props.history.push(`/page/${page.id}`);
		} else {
			this.setState({submitted: true, page: undefined})
		}
	}

	render() {
		if(!this.state.user) {
			return (
				<div className="App-login">
				<h1>Please log in first</h1>
				<Login ref="/create" history={this.props.history} />
				</div>
			);
		} else if(this.state.user && !this.state.submitted) {
			console.log(this.state.page)
			return(
				<div className="App-create">
					<form onSubmit={this.handleSubmit} className="App-form">
						Title:
						<br/>
						<input style={{width: "90%"}} type="text" onChange={(e)=>this.handleChange("title",e)} name="title" value={this.state.title}/>
						<br/>
						Body:
						<br/>
						<textarea style={{width: "90%", resize: 'none', verticalAlign: "top"}} onChange={(e)=>this.handleChange("body",e)} name="body" rows='30' value={this.state.body} />
						<br/>
						<button type="submit">Submit</button>
					</form>
					<div className="App-page">
						<section>
			              <h1>{this.state.title}</h1>
			            </section>
			        	<section className="App-content">
							<div dangerouslySetInnerHTML={{__html: this.state.nbody}}>
							</div>
						</section>
					</div>
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

export default Create;