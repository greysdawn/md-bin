import React, { Component } from 'react';
import * as fetch from 'node-fetch';

class Login extends Component {
	constructor() {
		super();
		this.state = {
						name: "name",
						pass: "pass",
						submitted: false
					}

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	async componentDidMount() {
		var us = await fetch('/api/user');
		if(us.status == 200) {
			var json = await us.json();
			this.setState({user: json, name: json.name, pass: json.pass})
		} else {
			this.setState({user: undefined});
		}
	}

	handleChange(name, e) {
		const n = name;
		const val = e.target.value;
		this.setState((state) => {
			state[n] = val;
			return state;
		})
	}

	async handleSubmit(e) {
		e.preventDefault();
		var st = this.state;

		var res = await fetch('/api/login', {
			method: "POST",
			body: JSON.stringify(st),
			headers: {
				"Content-Type": "application/json"
			}
		});

		this.setState({submitted: true});
	}

	render() {
		if(!this.state.submitted) {
			return(
				<form onSubmit={this.handleSubmit} className="Admin-form">
					<label>
					Name:{" "}
					<input type="text" onChange={(e)=>this.handleChange("name",e)} name="name" value={this.state.name}/>
					</label>
					<br/>
					<label>
					Pass:{" "}
					<input type="text" onChange={(e)=>this.handleChange("pass",e)} name="pass" value={this.state.pass}/>
					</label>
					<br/>
					<button className="App-button" type="submit">Submit</button>
				</form>
			);
		} else if(this.state.submitted == true && this.state.user) {
			return (
				<section>
				<p>Logged in!</p>
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

export default Login;