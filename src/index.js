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
			<div>
			<form onSubmit={this.handleSubmit}>
				<label> 
					Search:
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
  return <li>{props.value}</li>;
}

function RepoList(props) {
	if (props.repos){
		return (
		  <ul>
		    {props.repos.map((repo) =>
		      <RepoItem key={repo.id}
		                value={repo.name} />
		    )}
		  </ul>
		);  
	} 
	else {
		return null;
	}	
}

ReactDOM.render(
  < SearchForm />,
  document.getElementById('root')

);

