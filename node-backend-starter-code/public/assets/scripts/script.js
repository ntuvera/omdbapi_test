window.onload = function() {
  var apiKey = '&apikey=f526c299';
  var movieSearchUrl = 'http://www.omdbapi.com/?type=movie&s=';
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
    // clear results section on new search
    movieSearchResults.innerHTML = '';

    // log request return for reference to render
    var response = JSON.parse(searchRequest.response);

    if (response.Response === 'False') {
      // handle bad request and render
      movieSearchResults.innerHTML = response.Error;
    } else {
      // handle sucessful request and render
      var movieResults = JSON.parse(searchRequest.response);

      // retrieves top 10 search results, iterate
      // example reference: {
      // Title: "The Italian Job",
      // Year: "2003",
      // imdbID: "tt0317740",
      // Type: "movie",
      // Poster: "https://m.media-amazon.com/images/M/MV5BNDYyNzYxNjYtNmYzMC00MTE0LWIwMmYtNTAyZDBjYTIxMTRhXkEyXkFqcGdeQXVyNDk3NzU2MTQ@._V1_SX300.jpg"
      // },
      var movieList = response.Search;

      movieList.forEach(function(movie) {
        // create a div for each movie
        var elDiv = document.createElement('div');
        elDiv.setAttribute('class', 'result');
        elDiv.setAttribute('data-imdbID', movie.imdbID); // for later use to search specific movies
        // crate poster appendd to each div
        var posterImg = document.createElement('img');
        posterImg.setAttribute('class', 'poster');
        // handle missing posters
        if (movie.Poster === 'N/A') {
          posterImg.setAttribute(
            'src',
            './assets/images/placeholder-movie.png'
          );
        } else {
          posterImg.setAttribute('src', movie.Poster);
        }

        elDiv.appendChild(posterImg);
        // append relevant information to table next to poster
        var elTable = document.createElement('table');
        elTable.setAttribute('class', 'result-details');
        elDiv.appendChild(elTable);

        // iterate through object to get information and create the table
        for (var key in movie) {
          if (movie.hasOwnProperty(key)) {
            var tableRow = document.createElement('tr');
            var tableCellCategory = document.createElement('td');
            tableCellCategory.innerHTML = key;
            var tableCellInfo = document.createElement('td');
            tableCellInfo.innerHTML = movie[key];

            tableRow.appendChild(tableCellCategory);
            tableRow.appendChild(tableCellInfo);

            elTable.appendChild(tableRow);
          }
        }

        // show in search Results DOM
        movieSearchResults.appendChild(elDiv);
      });
    }
  }

  function clearFields(e) {
    // add ability to clear not just the form
    movieSearchResults.innerHTML = '';
  }
};
