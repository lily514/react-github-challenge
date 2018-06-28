import React from 'react';
import ReactDOM from 'react-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './index.css';

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

	// called when keyword text changes
	handleChange(event){
		this.setState({value: event.target.value});
	}

	// called when submit button clicked
	handleSubmit(event){
		this.setState({
			loading: true,
			results: undefined
		});
		this.performSearch(this.state.value, this.state.filter, this.state.order);
		event.preventDefault();
	}

	//if different order is chosen, updates state and searches again
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

	//if filter by language is chosen, updates state and searches again
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

	//Performs keyword search for repositories in github
	//includes params for filter and order
	performSearch(query, filter, order) {
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

//Select button lets user filter by language
//default is all languages
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

//Select button lets user choose how to order results
//Includes default (best match), most recent, and least recent
function OrderComponent(props){
		return(
		<select onChange={props.handler} className="custom-select">
			<option key='default' selected>Sort: Best Match</option>
            <option key='asc' value='asc'>Sort: Least Recent</option>
            <option key='desc' value='desc'>Sort: Most Recent</option>
		</select>

	)
}

//Represents the list of repositories from the search
//Also indicates if the results returned empty
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

//Component representing each repository returned from the search
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

	//Fetches commits from the last 7 days from the github api for a given repo
	//State only updates if response code is ok
	getCommits(){
	    fetch(`https://api.github.com/repos/${this.state.name}/commits?since=${SevenDaysPrior()}`)
	      .then(handleErrors)
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

	// called when preview button clicked.
	// toggles button text and clears commits if necessary
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
	  	{ this.state.preview ? <PreviewRepo commits={this.state.commits} /> : null }
	  	</div>
	  );
	}
}

//Displays a commit item in the CommitList
function CommitItem(props){
	var date = new Date(props.value.committer.date);
	var datestr = (date.getMonth()+1) + "/" + date.getDate() + '/' + date.getFullYear();
	return(
		<li className="commit-item"><strong>{datestr}:</strong> "{props.value.message}"</li>
	);
}

//Displays a list of commits (if any)
function CommitList(props) {
		return (
			<div>
			<h6> Recent commits: </h6>
			<ul className="commit-list">
				{props.commits.map((commit) =>
		      		<CommitItem key={commit.sha}
		                		value={commit.commit} />
		        )}
			</ul>
			</div>
		)
}

// Method parses commit json to create an object representing commits by contributor by date.
// data = {
// 	'June 1': {name: 'June 1', contributor1: 1},
// 	'June 2': {name: 'June 2', contributor1: 2, contributor2: 1}
// }
function getContributors(props){
	//TODO: REFACTOR so that we only calculate the date array once, instead of everytime we click preview
	var contributors = getDates(); 
	props.forEach(function(commit) {
		var name = 'unknown';
		if (commit.author != null){
			name = commit.author.login;
		} else {
			name = commit.commit.author.name;
		}
		var date = commit.commit.author.date;
		var commitDate = new Date(date);
		var datestr = monthsArray[commitDate.getMonth()] + ' ' + commitDate.getDate();
		console.log(name, datestr);
		if (contributors[datestr]){
			if (!contributors[datestr][name]){
				contributors[datestr][name] = 0;
			}
			contributors[datestr][name] += 1;
		}

	});
	console.log(contributors);
	return contributors;
}

// Method builds the graph from the dataset built by 'getContributors'
// props.method = 'getContributors'
// props.data = json from fetch of all commits in the last 7 days
// BarChart expects data to look like this:
// const data = [
//       {daylabel: 'Sunday', contributor1: 4000, contributor2: 2400},
//       {daylabel: 'Monday', contributor1: 3000, contributor2: 1398},
// ];
function CommitGraph(props){
	var dataset = props.method(props.data);
	var lines = [];
	var data = [];
	var authors = new Set();
	var colors = new Set();
	for(var key in dataset) {
		for (var label in dataset[key]){
			if (!authors.has(label) & label !== "name"){
				authors.add(label);
				var color = getRandomColor();
				while (colors.has(color)){
					color = getRandomColor();
				}
				colors.add(color);
				lines.push(<Bar stackId="a" dataKey={label} fill={color} />)
			}
		}
		data.push(dataset[key]);
	}
	return (
		<div>
		<h6>Recent Commits by Author: </h6>
		<BarChart width={600} height={300} data={data}
            margin={{top: 20, right: 30, left: 20, bottom: 5}}>
		<XAxis dataKey="name"/>
	       <YAxis/>
	       <CartesianGrid strokeDasharray="3 3"/>
	       <Tooltip/>
	       <Legend />
		{lines}	
		</BarChart>
		</div>
	);
}

// Builds the preview of a repository with a list of commits and a graph
// props contains the json of all commits returned by the fetch
function PreviewRepo(props){
	if (props.commits === undefined ) {
		return null;
	} else if ( props.commits.length === 0) {
		return (<h6><i>No recent commits.</i></h6>);
	} 
	else {
		return (
			<div className="preview">
				<CommitList commits={props.commits} />
				<CommitGraph method={getContributors} data={props.commits} />
			</div>
		);
	}
}

/** BEGIN HELPER METHODS **/

// helper method for when a fetch returns
// throws an error if the response is not ok
function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}

//defaults for filter and sort
const orderDefault = 'Sort: Best Match';
const filterDefault = 'Filter Language';

//popular languages on github, used for filtering by language
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

//Returns date seven days earlier for use with github api
//Github expects: YYYY-MM-DDTHH:MM:SSZ
function SevenDaysPrior(props){
	//https://stackoverflow.com/questions/19910161/javascript-calculating-date-from-today-date-to-7-days-before/20329800
	var date = new Date();
	var last = date.addDays(-6); // gets 6 days ago for total of 7 dates
	var day =last.getDate();
	var month=last.getMonth()+1;
	var year=last.getFullYear();
	return year + '-' + month + '-' + day + 'T00:00:00Z'
}

// Helper method used to add a day
//https://stackoverflow.com/questions/4413590/javascript-get-array-of-dates-between-2-dates
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

// Returns an array of date strings used for the labels on the bar chart
// example: if today was June 7: ['June 1', 'June 2', ... 'June 7']
function getDates() {
	var stopDate = new Date();
	var startDate = stopDate.addDays(-6);
    var dateArray = {};
    var currentDate = startDate;
    while (currentDate <= stopDate) {
    	currentDate = new Date(currentDate);
    	var datestr = monthsArray[currentDate.getMonth()] + ' ' + currentDate.getDate();
        dateArray[datestr] = {};
        dateArray[datestr]['name'] = datestr;
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
}

// Returns the text describing when a repository was last updated
// Props contains the 'updated_at' date string.
function LastUpdated(props){
	var date = new Date(props);
	var now = new Date();
	var difference = Math.abs(now - date) / 36e5;
	if (difference < 1) {
		var minutes = Math.floor(difference % 1 * 60)
		return minutes + " minutes ago."
	}
	else if (Math.floor(difference) === 1){
		return Math.floor(difference) + " hour ago."
	}
	else if (difference < 12 ) {
		return Math.floor(difference) + " hours ago."
	}
	else{
		return (monthsArray[date.getMonth()] + ' ' +date.getDate() + ', ' + date.getFullYear());
	}
}

//Used to generate random colors for the bar chart
//source: https://stackoverflow.com/questions/1484506/random-color-generator
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


ReactDOM.render(
  < SearchForm />,
  document.getElementById('app')

);

