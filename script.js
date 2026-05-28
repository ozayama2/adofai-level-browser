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
      <td>${level.title || ""}</td>
      <td>${level.artist || ""}</td>
      <td>${level.difficulty || ""}</td>
      <td>
         ${level.youtube_url
           ? `<button onclick="playVideo('${level.youtube_url}')">再生</button>`
           : `<span style="color:#666">なし</span>`
        }
      </td>
      
      <td>
  ${
    getWorkshopUrl(level) &&
    getWorkshopUrl(level).startsWith("http")
      ? `<a href="${getWorkshopUrl(level)}" target="_blank">Workshop</a>`
      : level.download_url &&
        level.download_url.startsWith("http")
          ? `<a href="${level.download_url}" target="_blank">Download</a>`
          : `<span style="color:#666">なし</span>`
  }
</td>
    `;

    tbody.appendChild(tr);
  }
}

function playVideo(url) {
  const id = getVideoId(url);
  if (!id) return;

  document.getElementById("player").innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/${id}"
      frameborder="0"
      allowfullscreen
    ></iframe>
  `;
}

function getVideoId(url) {
  if (!url) return "";

  let match = url.match(/youtu\.be\/([^?]+)/);
  if (match) return match[1];

  match = url.match(/[?&]v=([^&]+)/);
  if (match) return match[1];

  match = url.match(/embed\/([^?]+)/);
  if (match) return match[1];

  return "";
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
