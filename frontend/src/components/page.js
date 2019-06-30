import React, {Component, Fragment as Frag} from 'react';
import * as fetch from 'node-fetch';

class Page extends Component {
	constructor(props) {
		super(props);

		this.state = {id: this.props.match.params.id};
	}

	async componentDidMount() {
		var dat = await fetch('/api/page/'+this.state.id);
		if(dat.status == 200) {
			this.setState({post: await dat.json()})
		} else {
			this.setState({post: "404"});
		}
	}

	render() {
		var post = this.state.post || [];
		var dt = new Date(post.timestamp);
		if(post.id) {
			return (
				<Frag>
				<div className="App-page">
					<section>
		              <h1>{post.title}</h1>
		            </section>
		        	<section className="App-content">
						<div dangerouslySetInnerHTML={{__html: post.body}}>
						</div>
					</section>
				</div>
				<div className="App-buttons">
					<a className="App-button" href={`/page/${post.id}/edit`}>edit</a>
					<a className="App-button" href={`/page/${post.id}/delete`}>delete</a>
				</div>
				</Frag>
			);
		} else if(post == "404") {
			return (
				<div className="App-page">
					<section>
		              <h1>404</h1>
		            </section>
		        	<section className="App-content">
						<div>
							That post wasn't found
						</div>
					</section>
				</div>
			);
		} else {
			return(
				<p>Loading...</p>
			);
		}
	}
}

export default Page;