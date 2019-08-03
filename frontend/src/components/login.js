import React, { Component } from 'react';
import * as fetch from 'node-fetch';

class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
						name: "name",
						pass: "pass",
						submitted: false,
						ref: this.props.ref || "/"
					}
	}

	handleChange = (name, e) => {
		const n = name;
		const val = e.target.value;
		this.setState((state) => {
			state[n] = val;
			return state;
		})
	}

	handleSubmit = async (e) => {
		e.preventDefault();
		var st = this.state;

		var res = await fetch('/api/login', {
			method: "POST",
			body: JSON.stringify(st),
			headers: {
				"Content-Type": "application/json"
			}
		});

		if(res.status == 200) this.props.history.push(this.state.ref)
		else this.setState({submitted: true});
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