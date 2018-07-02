window.onload = function() {
  var apiKey = '&apikey=f526c299';
  var movieSearchUrl = 'http://www.omdbapi.com/?type=movie&s=';
  var detailSearchUrl = 'http://www.omdbapi.com/?i=';

  var movieSearchForm = document.getElementById('movie-search-form');
  var movieSearchResults = document.getElementById('search-results');

  movieSearchForm.addEventListener('submit', searchMovies);
  movieSearchForm.addEventListener('reset', clearFields);

  var currentMovie;

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
    // movieSearchResults.innerHTML = '';
    clearFields();

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
        elDiv.setAttribute('data-imdbID', movie.imdbID);
        // crate poster appendd to each div
        var posterImg = document.createElement('img');
        posterImg.setAttribute('class', 'poster result-listing');
        posterImg.setAttribute('data-imdbID', movie.imdbID); // for later use to search specific movies
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

        // delete uneeded information from table
        delete movie.Poster;
        delete movie.Response;

        for (var key in movie) {
          if (movie.hasOwnProperty(key)) {
            var tableRow = document.createElement('tr');
            var tableCellCategory = document.createElement('td');
            tableCellCategory.innerHTML = key;
            tableCellCategory.setAttribute('class', 'smallkey');
            var tableCellInfo = document.createElement('td');
            tableCellInfo.innerHTML = movie[key];

            tableRow.appendChild(tableCellCategory);
            tableRow.appendChild(tableCellInfo);

            elTable.appendChild(tableRow);
          }
        }

        // bring it all together
        movieSearchResults.appendChild(elDiv);
      });
    }

    // allow result divs to be clickable and runa detailed search
    var movieListing = document.getElementsByClassName('result-listing');

    // because elements are created after initial attachment of listeners, need to attach here

    for (var i = 0; i < movieListing.length; i++) {
      movieListing[i].addEventListener('click', movieDetailSearch);
    }
  }

  // create second search for more details
  function movieDetailSearch() {
    // create new HTTPRequest for detailed data
    detailSearch = new XMLHttpRequest();

    // grab imdbID and search by ID

    var imdbID = this.getAttribute('data-imdbid'); // using this because it's the scope of what we clicked

    detailSearch.onload = renderDetailResults;
    detailSearch.open('GET', detailSearchUrl + imdbID + apiKey);
    detailSearch.send();
  }

  // handle and render detailed results for one movie
  function renderDetailResults() {
    // clear Results to make room
    clearFields();

    // create new div to house detail information
    var detailDiv = document.createElement('div');

    // create table to display return information... again
    var detailTable = document.createElement('table');

    var response = JSON.parse(detailSearch.response);

    // hacky current movie save
    currentMovie = response;

    // need to handle Ratings which returns another object
    for (var key in response) {
      if (response.hasOwnProperty(key)) {
        var tableRow = document.createElement('tr');
        var tableCellCategory = document.createElement('td');
        tableCellCategory.innerHTML = key;
        var tableCellInfo = document.createElement('td');
        tableCellInfo.innerHTML = response[key];
        if (key === 'Ratings') {
          tableCellCategory.innerHTML = key;
          if (response.Ratings.length === 0) {
            tableCellInfo.innerHTML = ' ';
          } else {
            tableCellInfo.innerHTML = `${response[key][0].Source} : ${
              response[key][0].Value
            }`;
          }
        }
        tableRow.appendChild(tableCellCategory);
        tableRow.appendChild(tableCellInfo);
        detailTable.appendChild(tableRow);
      }
    }
    movieSearchResults.appendChild(detailTable);
    // render add to favorites button
    var buttonRow = document.createElement('tr');
    var elButton = document.createElement('button');
    var saveButtonCell = document.createElement('td');
    var saveCell = document.createElement('td');
    saveCell.innerHTML = 'Save?';
    elButton.innerHTML = 'Save to Favorites';
    elButton.setAttribute('class', 'add-to-favorites');
    elButton.setAttribute('imdbID', response.imdbID);

    saveButtonCell.appendChild(elButton);
    buttonRow.appendChild(saveCell);
    buttonRow.appendChild(saveButtonCell);
    detailTable.appendChild(buttonRow);

    // add clic eventlistener
    var favoritesButton = document.getElementsByClassName('add-to-favorites');
    for (var i = 0; i < favoritesButton.length; i++) {
      favoritesButton[i].addEventListener('click', addToFavorites);
    }
  }

  // need a button to be able to retrieve to favorites
  var favoritesButton = document.getElementById('favorites-button');
  favoritesButton.addEventListener('click', getFavorites);

  function getFavorites() {
    // send XMLHTTP GET  Request to server
    favoritesRequest = new XMLHttpRequest();

    favoritesRequest.onload = renderFavoritesList;
    favoritesRequest.open('GET', '/favorites');
    favoritesRequest.send();
    // render favorites same as Movie Results, utilize same detail viewer (renderDetailResults)
  }

  function renderFavoritesList() {
    // similar to renderMovies List -- refactor later?  consequence of onload XMLHttpRequest
    // clear results section on new search
    clearFields();

    var movieList = JSON.parse(favoritesRequest.response);

    movieList.forEach(function(movie) {
      // create a div for each movie
      var elDiv = document.createElement('div');
      elDiv.setAttribute('class', 'result');
      elDiv.setAttribute('data-imdbID', movie.imdbID); // for later use to search specific movies
      // crate poster appendd to each div
      var posterImg = document.createElement('img');
      posterImg.setAttribute('class', 'poster movie-listing');
      posterImg.setAttribute('data-imdbID', movie.imdbID);
      // handle missing posters
      if (movie.Poster === 'N/A') {
        posterImg.setAttribute('src', './assets/images/placeholder-movie.png');
      } else {
        posterImg.setAttribute('src', movie.Poster);
      }

      elDiv.appendChild(posterImg);
      // append relevant information to table next to poster
      var elTable = document.createElement('table');
      elTable.setAttribute('class', 'result-details');
      elDiv.appendChild(elTable);

      // iterate through object to get information and create the table

      // delete poster information because it's redundant
      delete movie.Poster;

      for (var key in movie) {
        if (movie.hasOwnProperty(key)) {
          var tableRow = document.createElement('tr');
          var tableCellCategory = document.createElement('td');
          tableCellCategory.innerHTML = key;
          tableCellCategory.setAttribute('class', 'smallkey');
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
    // allow result divs to be clickable and runa detailed search
    var movieListing = document.getElementsByClassName('movie-listing');

    // because elements are created after initial attachment of listeners, need to attach here

    for (var i = 0; i < movieListing.length; i++) {
      movieListing[i].addEventListener('click', movieDetailSearch);
    }
  }

  function addToFavorites() {
    // need a button to be able to add to favorites

    currentMovieSimplified = {
      Title: currentMovie.Title,
      Year: currentMovie.Year,
      imdbID: currentMovie.imdbID,
      Type: currentMovie.Type,
      Poster: currentMovie.Poster,
    };

    var parsedCurrentMovie = JSON.stringify(currentMovieSimplified);

    console.log(currentMovieSimplified);
    // send XMLHTTP POST Request to server
    addFavoriteRequest = new XMLHttpRequest();

    addFavoriteRequest.onload = function() {
      alert('Movie Added to Favorites');
      console.log(addFavoriteRequest);
    };

    addFavoriteRequest.open('POST', '/favorites', true);
    addFavoriteRequest.setRequestHeader('Content-type', 'application/json');
    addFavoriteRequest.send(parsedCurrentMovie);

    renderFavoritesList();
  }

  function clearFields(e) {
    // add ability to clear not just the form
    movieSearchResults.innerHTML = '';
  }
};
