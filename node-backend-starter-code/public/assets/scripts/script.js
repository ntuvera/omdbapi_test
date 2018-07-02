window.onload = function() {
  var apiKey = '&apikey=f526c299';
  var movieSearchUrl = 'http://www.omdbapi.com./?type=movie&s=';
  var detailSearchUrl = 'http://www.omdbapi.com./?i=';

  var movieSearchForm = document.getElementById('movie-search-form');
  var movieSearchResults = document.getElementById('search-results');

  movieSearchForm.addEventListener('submit', searchMovies);
  movieSearchForm.addEventListener('reset', clearFields);

  function searchMovies(e) {
    // prevent page redicetion by default
    e.preventDefault();

    // gather information needed to search and encode
    var queryTitle = document.getElementById('movie-title-input').value;
    var queryTitleURI = encodeURIComponent(queryTitle);

    // httpRequest for search
    searchRequest = new XMLHttpRequest();

    searchRequest.onload = renderMoviesList;
    searchRequest.open('GET', movieSearchUrl + queryTitleURI + apiKey);
    searchRequest.send();
  }

  // handle initial movie search render
  function renderMoviesList() {
    console.log(searchRequest);
  }

  function clearFields(e) {
    console.log('clear all fields');
    // add ability to clear not just the form
  }
};
