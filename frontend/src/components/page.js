import React, {Component, Fragment as Frag} from 'react';
import * as fetch from 'node-fetch';
import * as showdown from 'showdown';
import * as sanitize from 'sanitize-html';

showdown.setOption('simplifiedAutoLink', true);
showdown.setOption('simpleLineBreaks', true);
showdown.setOption('openLinksInNewWindow', true);
showdown.setOption('underline', true);
showdown.setOption('tables', true);
showdown.setOption('strikethrough', true);
showdown.setOption('tasklists', true);

const conv = new showdown.Converter();

var tags = ['img','h1','h2','u','del'];

class Page extends Component {
	constructor(props) {
		super(props);

		this.state = {
					  id: this.props.match.params.id,
					  user: this.props.user,
					  edit: {enabled: false},
					  deleted: null
					 };
	}

	async componentDidMount() {
		var dat = await fetch('/api/page/'+this.state.id);
		if(dat.status == 200) {
			this.setState({post: await dat.json()})
		} else {
			this.setState({post: "404"});
		}
	}

	enableEdit = ()=> {
		var page = Object.assign({}, this.state.post);

		this.setState({edit: {enabled: true, data: page}})
	}

	handleChange = (name, e) => {
		const n = name;
		const val = e.target.value;
		this.setState((state) => {
			if(n == "body") {
				state.edit.data['nbody'] = sanitize(conv.makeHtml(val), {
									allowedTags: sanitize.defaults.allowedTags.concat(tags)
								});
			}
			state.edit.data[n] = val;
			return state;
		})
	}

	handleSubmit = async (e) => {
		e.preventDefault();
		var st = this.state.edit.data;
		st.user = this.state.user;
		var page;

		var res = await fetch('/api/page', {
			method: "PUT",
			body: JSON.stringify(st),
			headers: {
				"Content-Type": "application/json"
			}
		});

		if(res.status == 200) {
			page = this.state.edit.data;
			page.body = this.state.edit.data.nbody;
			this.setState({submitted: true, post: page, edit: {enabled: false}});
		} else {
			this.setState({submitted: true, post: undefined, edit: {enabled: false}})
		}
	}

	deletePage = async ()=> {
		var del = await fetch(`/api/page/${this.state.id}/delete`);
		if(del.status == 200) {
			this.setState({deleted: "success"});
			this.props.history.replace("/pages");
		} else {
			this.setState({deleted: "fail"});
		}
	}

	render() {
		var post = this.state.post || [];
		var edit = this.state.edit;
		var dt = new Date(post.timestamp);
		if(post.id) {
			if(edit.enabled) {
				return (
					<div className="App-create">
						<form onSubmit={this.handleSubmit} className="App-form">
							Title:
							<br/>
							<input style={{width: "90%"}} type="text" onChange={(e)=>this.handleChange("title",e)} name="title" value={edit.data.title}/>
							<br/>
							Body:
							<br/>
							<textarea style={{width: "90%", resize: 'none', verticalAlign: "top"}} onChange={(e)=>this.handleChange("body",e)} name="body" rows='30' value={edit.data.body} />
							<br/>
							<button type="submit">Submit</button>
						</form>
						<div className="App-page">
							<section>
				              <h1>{edit.data.title}</h1>
				            </section>
				        	<section className="App-content">
								<div dangerouslySetInnerHTML={{__html: edit.data.nbody}}>
								</div>
							</section>
						</div>
					</div>
				)
			} else {
				return (
					<Frag>
					<div className="App-page">
						<section>
						  {this.state.deleted == "fail" && <h1 style={{color: "red"}}>Delete failed. Please try again.</h1>}
			              <h1>{post.title}</h1>
			            </section>
			        	<section className="App-content">
							<div dangerouslySetInnerHTML={{__html: post.body}}>
							</div>
						</section>
					</div>
					{this.state.user &&
						<div className="App-buttons">
							<button className="App-button" onClick={this.enableEdit}>edit</button>
							<button className="App-button" onClick={this.deletePage}>delete</button>
						</div>
					}
					</Frag>
				);
			}
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