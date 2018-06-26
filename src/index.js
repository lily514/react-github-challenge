import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class SearchForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: '',
			results: [],
			loading: false,
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(event){
		this.setState({value: event.target.value});
	}

	handleSubmit(event){
		this.setState({
			loading: true
		})
		this.performSearch(this.state.value);
		event.preventDefault();
	}

	performSearch(query) {
	    //&sort=stars&order=desc`)
	    fetch(`https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc`)
	      .then(response => response.json())
	      .then(responseData => {
	      	console.log(responseData.items);
	        this.setState({
	          results: responseData.items,
	          loading: false
	        });
	      })
	      .catch(error => {
	        console.log('Error fetching and parsing data', error);
	      });
  	}

	render(){
		return (
			<div className="search-container">
			<h1>Github Repository Search</h1>
			<form className="search-form" onSubmit={this.handleSubmit}>
				<label> 
					<input 
						type="text" 
						value={this.state.value} 
						onChange={this.handleChange}
					/>
				</label>
				<input type="submit" value="Submit"/>
			</form>
				<RepoList repos={this.state.results}/>
			</div>

		);
	}
}

function RepoList(props) {
	if (props.repos){
		return (
		  <ul className="search-results">
		    {props.repos.map((repo) =>
		      <RepoItem key={repo.id}
		                value={repo} />
		    )}
		  </ul>
		);  
	} 
	else {
		return null;
	}	
}

class RepoItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: this.props.value.full_name,
			url: this.props.value.html_url,
			ownder: this.props.value.owner.login,
			description: this.props.value.description,
			preview: false,
			buttontext:'Preview',
			commits: []
		};
		this.handlePreview = this.handlePreview.bind(this);

	}

	getCommits(){
	    fetch(`https://api.github.com/repos/${this.state.name}/commits`)
	      .then(response => response.json())
	      .then(responseData => {
	      	console.log(responseData);
	        this.setState({
	          commits: responseData,
	        });
	      })
	      .catch(error => {
	        console.log('Error fetching and parsing data', error);
	      });

	}

	handlePreview(event){
		console.log('clicked preview');
		if (!this.state.preview){
			this.getCommits();
			this.setState({
				preview: !this.state.preview,
				buttontext: 'Close Preview'
			});
		}
		else{
			this.setState({
				preview: !this.state.preview,
				buttontext: 'Preview',
				commits: []
			});
		}
		
	}

	render(){
	  return (
	  	<div className="search-result-item">
	  	<div className="row">
	  		<div className="flex-column item-name">
	  			<h3><a href={this.state.url}>{this.state.name}</a></h3>
	  		</div>
	  		<div className="flex-column ">
	  			<button className="preview-button btn btn-primary btn-sm " onClick={this.handlePreview}>{this.state.buttontext}</button>
	  		</div>
	  	</div>
	  	<p>{this.state.description}</p>
	  	<div className="preview">
	  		<CommitList commits={this.state.commits} />
	  	</div>
	  	</div>
	  );
	}
}

function CommitItem(props){
	return(
		<li>{props.value.message}</li>
	);
}


function CommitList(props) {
	if (props.commits) {
		return (
			<ul className="commit-list">
				{props.commits.slice(0,5).map((commit) =>
		      		<CommitItem key={commit.sha}
		                		value={commit.commit} />
		        )}
			</ul>
		)
	}
	else {
		return null;
	}
}




ReactDOM.render(
  < SearchForm />,
  document.getElementById('app')

);

