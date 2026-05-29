let levels = [];
let filteredLevels = [];
let favorites =
  JSON.parse(localStorage.getItem("favorites") || "[]");

function getWorkshopUrl(level) {
  return level.workshop || level.workshop_url || "";
}

Papa.parse("adofai_levels.csv", {
  download: true,
  header: true,

  complete: function(results) {
    levels = results.data;

    search();

    document
      .getElementById("search")
      .addEventListener("input", search);

    document
      .getElementById("sort")
      .addEventListener("change", search);
  }
});

function search() {

  const keyword = document
    .getElementById("search")
    .value
    .toLowerCase();

    const favoritesOnly =
      document.getElementById("favorites-only").checked;
  
    const sort = document
    .getElementById("sort")
    .value;

  let filtered = levels.filter(level => {
    const text = ((level.title || "") + " " + (level.artist || "")).toLowerCase();
    const matchesSearch =
    text.includes(keyword);

    const matchesFavorite =
      !favoritesOnly ||
      favorites.includes(getLevelId(level));

    return matchesSearch && matchesFavorite;
  });

  filtered.sort((a, b) => {
    if (sort === "difficulty_desc") return (b.difficulty || 0) - (a.difficulty || 0);
    if (sort === "difficulty_asc") return (a.difficulty || 0) - (b.difficulty || 0);
    if (sort === "tiles_desc") return (b.tile_count || 0) - (a.tile_count || 0);
    if (sort === "tiles_asc") return (a.tile_count || 0) - (b.tile_count || 0);
    if (sort === "title_asc") return (a.title || "").localeCompare(b.title || "");
    return 0;
  });
  currentLevels = filtered;
  filteredLevels = filtered;
  render(filtered);
}

function render(data) {

  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";

  document.getElementById("count").textContent = `${data.length} 件`;

  for (const [index, level] of data.entries()) {

    const tr = document.createElement("tr");

    tr.innerHTML = `
  <td>
    <button onclick="toggleFavorite(${index})">
      ${isFavorite(level) ? "★" : "☆"}
    </button>
  </td>

  <td>
    <strong>${level.title}</strong><br>

    <span style="color:#888;">
      ${level.artist || ""}
    </span><br>

    ${
  level.youtube_url
    ? `
      <button onclick="playVideo('${level.youtube_url}', ${index})">
        ▶ YouTube
      </button>
      <div id="player-${index}"></div>
    `
    : ""
}

    ${
      getWorkshopUrl(level) &&
      getWorkshopUrl(level).startsWith("http")
        ? `<a href="${getWorkshopUrl(level)}" target="_blank"> Workshop</a>`
        : level.download_url &&
          level.download_url.startsWith("http")
            ? `<a href="${level.download_url}" target="_blank"> Download</a>`
            : ""
    }
  </td>

  <td>
    ${level.difficulty || ""}
  </td>
`;

    tbody.appendChild(tr);
  }
}

function playVideo(url, index) {

  const container = document.getElementById(`player-${index}`);

  if (container.innerHTML !== "") {
    container.innerHTML = "";
    return;
  }

  const videoId = extractYouTubeId(url);
  
if (!videoId) return;

  container.innerHTML = `
    <iframe
      width="200"
      height="113"
      src="https://www.youtube.com/embed/${videoId}"
      frameborder="0"
      allowfullscreen>
    </iframe>
  `;
}


function getLevelId(level) {

  return [
    level.title,
    level.artist,
    level.author,
    level.difficulty,
    getWorkshopUrl(level),
    level.download_url
  ].join("|");

}

function isFavorite(level) {
  return favorites.includes(getLevelId(level));
}

function toggleFavorite(index) {

  const level = currentLevels[index];
  const id = getLevelId(level);

  if (favorites.includes(id)) {
    favorites =
      favorites.filter(f => f !== id);
  } else {
    favorites.push(id);
  }

  localStorage.setItem(
    "favorites",
    JSON.stringify(favorites)
  );

  search();
}

document
  .getElementById("favorites-only")
  .addEventListener("change", search);

function extractYouTubeId(url) {

  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;

  const match = url.match(regExp);

  return match && match[2].length === 11
    ? match[2]
    : null;
}
