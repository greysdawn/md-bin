import React, {Component, Fragment as Frag} from 'react';
import * as fetch from 'node-fetch';

class Index extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="App-page">
				<section>
	              <h1>About</h1>
	            </section>
	        	<section className="App-content">
					This website serves as a bin for markdown that we want to share with others.{" "}
					It's mainly just an experiment or way of gaining experience with web design,{" "}
					and is currently only for personal use. If you'd like to see the source code,{" "}
					you can check out the github <a href="https://github.com/greysdawn/md-bin">here</a>
				</section>
			</div>
		);
	}
}

export default Index;