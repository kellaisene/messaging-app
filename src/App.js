import React, { Component } from 'react';
import './App.css';

class App extends Component {
	state = {
		text: {
			message: '',
			contactNumber: ''
		}
	};

	handleContactNumberInput = (e) => {
		const { text } = this.state;
		this.setState({ text: { ...text, contactNumber: e.target.value } });
	};

	handleChangesMessageArea = (e) => {
		const { text } = this.state;
		this.setState({ text: { ...text, message: e.target.value } });
	};

	sendMessage = () => {
		// Here I want to hit the send text endpoint
		const { text } = this.state;
		alert(`Text has been sent!`);
		this.setState({
			text: {
				message: '',
				contactNumber: ''
			}
		});
	};

	render() {
		// I'll want to add something to view the messages. Maybe make a thread like texting?
		return (
			// Just want to send the message to an actual phone and then move on from there
			<div className="App">
				<header className="App-header">
					<label>Phone Number:</label>
					<input
						className="input-contact-number"
						type="text"
						value={this.state.text.contactNumber}
						onChange={this.handleContactNumberInput}
					/>
					<label>Message:</label>
					<textarea
						className="text-area-message"
						type="text"
						value={this.state.text.message}
						onChange={this.handleChangesMessageArea}
					/>
					<button className="send-text-button" onClick={this.sendMessage}>
						Send Text
					</button>
				</header>
			</div>
		);
	}
}

export default App;
