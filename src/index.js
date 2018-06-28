import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const sortDefault = 'Sort by';
const filterDefault = 'Filter by';

class SearchForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: '',
			results: [],
			loading: false,
			sort: sortDefault,
			filter: filterDefault
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.onSortSelect = this.onSortSelect.bind(this);
		this.onFilterSelect = this.onFilterSelect.bind(this);
	}

	handleChange(event){
		this.setState({value: event.target.value});
	}

	handleSubmit(event){
		this.setState({
			loading: true,
			results: []
		});
		this.performSearch(this.state.value);
		event.preventDefault();
	}

	onSortSelect(event){
		console.log(event.target.value)
		this.setState({
			sort: event.target.value,
			results: []
		});
		if (this.state.value !== ''){
			this.performSearch(this.state.value);	
		}
		event.preventDefault();
	}

	onFilterSelect(event){
		console.log(event.target.value)
		this.setState({
			filter: event.target.value,
			results: []
		});
		if (this.state.value !== ''){
			this.performSearch(this.state.value, event.target.value);	
		}
		
		event.preventDefault();
	}


	performSearch(query, filter) {
	    //&sort=stars&order=desc`)
	    //+ "?access_token=aa6f1f03df844f3049fcd49aab7509f0a"
	    var url = "https://api.github.com/search/repositories?q=" + query ;
	    if(filter !== filterDefault && filter !== undefined){
	    	url += "+language=" + filter;
	    }
	    fetch(url)
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
				<div className="form-row">
				<div className="form-group col-lg-5">
					<input 
						type="text" 
						value={this.state.value} 
						onChange={this.handleChange}
						className="form-control"
						placeholder="Search for a repository..."
					/>
				</div>

				<div className="form-group col-lg-3">
				<input className="btn btn-primary" type="submit" value="Submit"/>
				</div>

				<div className="form-group col-lg-2">
					<FilterComponent handler={this.onFilterSelect} />
				</div>
				<div className="form-group col-lg-2">
					<SortComponent handler={this.onSortSelect} />
				</div>

				</div>
			</form>
				<RepoList repos={this.state.results}/>
			</div>

		);
	}
}

const languages = [
	"C",
	"C#",
	"C++",
	"Clojure",
	"CoffeeScript",
	"CSS",
	"Go",
	"Haskell",
	"HTML",
	"Java",
	"JavaScript",
	"Lua",
	"Matlab",
	"Objective-C",
	"Perl",
	"PHP",
	"Python",
	"R",
	"Ruby",
	"Scala",
	"Shell",
	"Swift",
	"TeX",
	"Vim script"];

//?q=tetris+language:assembly
function FilterComponent(props) {
	return(
		<select onChange={props.handler} className="custom-select">
			<option key='default' selected>{filterDefault}</option>
			{languages.map((lang) =>
		      <option key={lang} value={lang}>{lang}</option>
		    )}
		</select>
	)					
}

const sortable = [
"Best Match",
"Ascending",
"Descending"
]

function SortComponent(props){
		return(
		<select onChange={props.handler} className="custom-select">
			<option key='default' selected>{sortDefault}</option>
			{sortable.map((opt) =>
		      <option key={opt} value={opt}>{opt}</option>
		    )}
		</select>

	)
}

function RepoList(props) {
	if (props.repos === undefined || props.repos.length == 0) {
		return null;
		//TODO: how to tell if the results return empty
	} else {
		return (
		  <ul className="search-results">
		    {props.repos.map((repo) =>
		      <RepoItem key={repo.id}
		                value={repo} />
		    )}
		  </ul>
		);  
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

	//fetch(`https://api.github.com/repos/${this.state.name}/commits?since=${SevenDaysPrior()}`
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
	  			<h4><a href={this.state.url}>{this.state.name}</a></h4>
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
	var date = props.value.committer.date.slice(0,10)
	return(
		<li>{date}: "{props.value.message}"</li>
	);
}

//currently only shows most recent 10 commits 
function CommitList(props) {
	if (props.commits) {
		return (
			<ul className="commit-list">
				{props.commits.slice(0,10).map((commit) =>
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

//Github expects: YYYY-MM-DDTHH:MM:SSZ
function SevenDaysPrior(){
	//https://stackoverflow.com/questions/19910161/javascript-calculating-date-from-today-date-to-7-days-before/20329800
	var days = 7; // Days you want to subtract
	var date = new Date();
	var last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
	var day =last.getDate();
	var month=last.getMonth()+1;
	var year=last.getFullYear();
	return year + '-' + month + '-' + day + 'T00:00:00Z'
}


ReactDOM.render(
  < SearchForm />,
  document.getElementById('app')

);

