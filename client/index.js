import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

class Main extends Component {
	constructor() {
		super();
		this.state = {
			file: null
		};
	}

	submitFile = (event) => {
		event.preventDefault();
		const formData = new FormData();
		formData.append('file', this.state.file[0]);
		axios
			.post(`/test-upload`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			})
			.then((response) => {
				// handle your response;
				console.log('response', response);
			})
			.catch((err) => {
				console.Error(err);
			});
	};
	handleFileUpload = (event) => {
		console.log('fffffffff', event.target.files);
		this.setState({ file: event.target.files });
	};

	render() {
		console.log('from state:', this.state.file);
		return (
			<div id="main">
				<div id="navbar">
					<div>Upload Images</div>
				</div>
				<div id="container">
					<form onSubmit={this.submitFile}>
						<input label="upload file" type="file" onChange={this.handleFileUpload} />
						<button type="submit">Send</button>
						<img src={this.state.file} />
					</form>
				</div>
			</div>
		);
	}
}

ReactDOM.render(<Main />, document.getElementById('app'));
