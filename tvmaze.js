"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");

// create a const with default picture if the show does not have an image
const missingShowImage = "http://tinyurl.com/missing-tv";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  // get the tv maze api results for the specific search term
  let response = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`);

  console.log(response.data);
  // map response data to search through the results 
  let shows = response.data.map(result => {
    // assign show results to show
    let show = result.show;
    // have map return the show's id, name, summary, and image if there is no image use turnary operator to return the default image.
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : missingShowImage,
    };
  });

  // return shows, which is the object with the id, name, summary, and image of the term that was searched.
  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  // assign show list id element from the html to a variable so we can append the show information to it.
  const $showsList = $("#shows-list");
  // empty the shows list element to reset it so we can populate it with the specific show we selected 
  $showsList.empty();

  // use for of loop to go through the shows and populate it with shows relevant to the search term
  for (let show of shows) {
    // use jQ to create an object literal html div containing the show's id, summary, epispodes, and image.
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-dark btn-sm get-episodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

      // append show DOM to html shows-list div and loop to the next show until all relevant shows are displayed
    $showsList.append($show);  
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

// handle submit button function
$searchForm.on("submit", async function (evt) {
  // prevent page from refreshing when submitting show
  evt.preventDefault();

  // set term equal to the value input to the search bar
  // let term = $("#search-query").val();
  // if there is no term, then return 
  // if(!term) {
  //   return;
  // }

  // $("#episodes-area").hide();

  // let shows = await getShowsByTerm(term);

  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) { 
  // get show episode data by searching the show id and return the data into response
  let response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  // map through episode data and create an object for each episode that contains the episode id, name, season, and episode number.
  let episodes = response.data.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number,
  }));

  console.log(episodes);
  // return episodes which contains array of all the episodes as objects
  return episodes;
}

/** Write a clear docstring for this function... */

// create the dom with the episode information and append it to the episode area
function populateEpisodes(episodes) { 
  // select the episodes-list id element in the dom
  const $episodeList = $("#episodes-list");
  // empty the area so we can populate newly requested episodes
  $episodeList.empty();

  console.log(episodes);
  // us for of loop to create an item containing a new list element with the episode name, season, and number
  for(let episode of episodes) {
    let $item = $(
      `<li>
          ${episode.name}
          (season ${episode.season}, episode ${episode.number})
      </li>
      `);

      // after the episode is created append it to the episode list and move on to the next episode until they are all appended.
      $episodeList.append($item);
  }
  // show the episodes area so the user can see them
  $("#episodes-area").show();
}

// display episodes when button with class get-episodes, which was created in populate shows, is clicked
$("#shows-list").on("click", ".get-episodes", async function handleEpisodeClick(e) {
  // assign show id to the clicked show's id
  let showId = $(e.target).closest(".Show").data("show-id");
  console.log(showId);
  // run getEpisodesOfShow function on the showId
  let episodes = await getEpisodesOfShow(showId);
  // run populateEpisodes with the episodes returned from getEpisodes
  populateEpisodes(episodes);
})