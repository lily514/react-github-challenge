import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const orderDefault = 'Sort: Best Match';
const orderDefaulted = 'bm'; //best match is default too
const filterDefault = 'Filter Language';

class SearchForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: '',
			results: undefined,
			loading: false,
			order: orderDefault,
			filter: filterDefault,
			showResults: false,
			count: 0
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.onOrderSelect = this.onOrderSelect.bind(this);
		this.onFilterSelect = this.onFilterSelect.bind(this);
	}

	handleChange(event){
		this.setState({value: event.target.value});
	}

	handleSubmit(event){
		this.setState({
			loading: true,
			results: undefined
		});
		this.performSearch(this.state.value);
		event.preventDefault();
	}

	onOrderSelect(event){
		console.log(event.target.value)
		this.setState({
			order: event.target.value,
			results: undefined
		});
		if (this.state.value !== ''){
			this.performSearch(this.state.value, this.state.filter, event.target.value);	
		}
		event.preventDefault();
	}

	onFilterSelect(event){
		console.log(event.target.value)
		this.setState({
			filter: event.target.value,
			results: undefined
		});
		if (this.state.value !== ''){
			this.performSearch(this.state.value, event.target.value, this.state.order);	
		}
		
		event.preventDefault();
	}

//search?o=desc&q=hello&s=updated&type=Repositories
	performSearch(query, filter, order) {
	    //+ "?access_token=aa6f1f03df844f3049fcd49aab7509f0a"
	    var url = "https://api.github.com/search/repositories?q=" + query ;
	    if(filter !== filterDefault && filter !== undefined){
	    	url += "+language:" + filter;
	    }
	    if(order !== orderDefault && order !== undefined){
	    	url += "&sort=updated&order=" + order;
	    }
	    console.log(url);
	    fetch(url
	    	// {method: 'get', headers: 
	    	// new Headers({'Accept': 'application/vnd.github.mercy-preview+json', 'Access-Control-Allow-Origin':'*'}) }
	    )
	      .then(response => response.json())
	      .then(responseData => {
	      	console.log(responseData.items);
	        this.setState({
	          results: responseData.items,
	          loading: false,
	          showResults: true,
	          count: responseData.total_count
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
						{ this.state.showResults ? <FilterComponent handler={this.onFilterSelect} /> : null }
					</div>
					<div className="form-group col-lg-2">
						{ this.state.showResults ? <OrderComponent handler={this.onOrderSelect} /> : null }
					</div>
				</div>
			</form>
				{ this.state.showResults ? <RepoList repos={this.state.results} total={this.state.count}/> : null }
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
		      <option key={lang} value={lang}>Filter: {lang}</option>
		    )}
		</select>
	)					
}

function OrderComponent(props){
		return(
		<select onChange={props.handler} className="custom-select">
			<option key='default' selected>Sort: Best Match</option>
            <option key='asc' value='asc'>Sort: Ascending</option>
            <option key='desc' value='desc'>Sort: Descending</option>
		</select>

	)
}

function RepoList(props) {
	if (props.repos === undefined ) {
		return null;
	} else if ( props.repos.length === 0) {
		return <p>No matching results</p>
		//TODO: how to tell if the results return empty
	} else {
		return (
		  <ul className="search-results">
		  <h5>Showing {props.repos.length} of {props.total} results.</h5>
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
			updated_at: this.props.value.updated_at,
			preview: false,
			buttontext:'Preview',
			commits: undefined
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
				commits: undefined
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
	  	<p>Updated: {LastUpdated(this.state.updated_at)} </p>
	  	{ this.state.preview ? <CommitList commits={this.state.commits} /> : null }
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
	if (props.commits === undefined ) {
		return null;
	} else if ( props.commits.length === 0) {
		return <p>No commits.</p>
		//TODO: how to tell if the results return empty
	} 
	else {
		return (
			<div className="preview">
			<p> Recent commits: </p>
			<ul className="commit-list">
				{props.commits.slice(0,10).map((commit) =>
		      		<CommitItem key={commit.sha}
		                		value={commit.commit} />
		        )}
			</ul>
			</div>
		)
	}
}

const monthsArray = [
"January",
"February",
"March",
"April",
"May",
"June",
"July",
"August",
"September",
"October",
"November",
"December"]

//Github expects: YYYY-MM-DDTHH:MM:SSZ
function SevenDaysPrior(props){
	//https://stackoverflow.com/questions/19910161/javascript-calculating-date-from-today-date-to-7-days-before/20329800
	var days = 7; // Days you want to subtract
	var date = new Date();
	var last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
	var day =last.getDate();
	var month=last.getMonth()+1;
	var year=last.getFullYear();
	return year + '-' + month + '-' + day + 'T00:00:00Z'
}

function LastUpdated(props){
	console.log(props)
	var date = new Date(props);
	var now = new Date();
	var today = (now.getDate() + "");
	var difference = Math.abs(now - date) / 36e5;
	if (difference < 1) {
		var minutes = Math.floor(difference % 1 * 60)
		return minutes + "minutes ago."

	}
	else if (difference < 12 ) {
		return Math.floor(difference) + " hours ago."
	}
	else{
		return (monthsArray[date.getMonth()] + ' ' +date.getDate() + ', ' + date.getFullYear());
	}
	
	
}



ReactDOM.render(
  < SearchForm />,
  document.getElementById('app')

);

