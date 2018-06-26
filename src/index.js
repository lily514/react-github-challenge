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
	    fetch(`https://api.github.com/search/repositories?q=${query}`)
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

function RepoItem(props) {
  const repo=props.value
  return (
  	<div className="search-result-item">
  	<div class="row">
  		<div class="flex-column " className="item-name">
  			<h3><a href={repo.html_url}>{repo.full_name}</a></h3>
  		</div>
  		<div class="flex-column ">
  			<button class="preview-button btn btn-primary btn-sm ">Preview</button>
  		</div>
  	</div>
  	
  	<p>{repo.description}</p>
  	</div>
  );
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

function RepoData(props){
	if (props.repos){

	}
}

ReactDOM.render(
  < SearchForm />,
  document.getElementById('app')

);

