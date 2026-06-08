	let levels = [];
let filteredLevels = [];
let favorites =
  JSON.parse(localStorage.getItem("favorites") || "[]");
let minDifficulty = 1;
let maxDifficulty = 25;
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

    const slider = document.getElementById("difficulty-slider");

noUiSlider.create(slider, {
  start: [1, 25],
  connect: true,
  step: 1,
  range: {
    min: 1,
    max: 25
  }
});

slider.noUiSlider.on("update", (values) => {

  minDifficulty = Number(values[0]);
  maxDifficulty = Number(values[1]);

  document.getElementById("minDiff").textContent =
    minDifficulty;

  document.getElementById("maxDiff").textContent =
    maxDifficulty;

  search();
});

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
const text = ((level.title || "") + " " + (level.artist || "") + " " + (level.creator || "")).toLowerCase();
    const matchesSearch =
    text.includes(keyword);

    const matchesFavorite =
      !favoritesOnly ||
      favorites.includes(getLevelId(level));

    const difficulty =
  Number(level.difficulty || 0);

const matchesDifficulty =
  difficulty >= minDifficulty &&
  difficulty <= maxDifficulty;

return (
  matchesSearch &&
  matchesFavorite &&
  matchesDifficulty
);
  });

  filtered.sort((a, b) => {
    if (sort === "difficulty_desc") return (b.difficulty || 0) - (a.difficulty || 0);
    if (sort === "difficulty_asc") return (a.difficulty || 0) - (b.difficulty || 0);
    if (sort === "tiles_desc") return (b.tile_count || 0) - (a.tile_count || 0);
    if (sort === "tiles_asc") return (a.tile_count || 0) - (b.tile_count || 0);
    if (sort === "bpm_desc") {
      const aBpm = Number(a.max_bpm);
      const bBpm = Number(b.max_bpm);

      if (!aBpm) return 1;
      if (!bBpm) return -1;

      return bBpm - aBpm;
    }

    if (sort === "bpm_asc") {
      const aBpm = Number(a.max_bpm);
      const bBpm = Number(b.max_bpm);

      if (!aBpm) return 1;
      if (!bBpm) return -1;

      return aBpm - bBpm;
    }
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
    tr.id = `row-${index}`;

    tr.innerHTML = `
  <td>
    <button onclick="toggleFavorite(${index})">
      ${isFavorite(level) ? "★" : "☆"}
    </button>
  </td>

    <td>
    <div class="level-info">

      ${
        level.youtube_url
					          ? `<img
               class="thumbnail"
               src="${getThumbnail(level.youtube_url)}"
               alt="">`
          : ""
      }

      <div class="level-text">

        <strong>${level.title}</strong><br>

        <span style="color:#888;">
          ${level.artist || ""}
        </span>

        <span class="desktop-meta">
          <br>
          <a
            class="creator-link"
            href="#"
            onclick="searchCreator('${level.creator || ""}'); return false;"
          >
            ${level.creator || "Unknown"}
          </a>
          ${Number(level.max_bpm) > 0 ? ` • ${level.max_bpm} BPM` : ""}
          • ${level.tile_count || "?"} Tiles
        </span>

        ${
          level.tags
            ? `<br><span class="desktop-tags">${level.tags.replaceAll(", ", " • ")}</span>`
            : ""
        }

        <br>

        ${
          level.youtube_url
            ? `<button onclick="playVideo('${level.youtube_url}')">▶ YouTube</button>`
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

      </div>
    </div>
  </td>

  <td>
    ${level.difficulty || ""}
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

function getThumbnail(url) {
  const id = getVideoId(url);

  return id
    ? `https://img.youtube.com/vi/${id}/mqdefault.jpg`
    : "";
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

function searchCreator(creator) {
  const searchBox = document.getElementById("search");
  searchBox.value = creator;
  search();
  searchBox.focus();
  searchBox.select();
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

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("sort").value = "difficulty_asc";
    if (sort === "tiles_desc") return (b.tile_count || 0) - (a.tile_count || 0);
    if (sort === "tiles_asc") return (a.tile_count || 0) - (b.tile_count || 0);
    if (sort === "bpm_desc") return (b.max_bpm || 0) - (a.max_bpm || 0);
    if (sort === "bpm_asc") return (a.max_bpm || 0) - (b.max_bpm || 0);
  search();
});

document
  .getElementById("random-btn")
  .addEventListener("click", randomLevel);

function randomLevel() {

  if (!currentLevels.length) return;

  const index =
    Math.floor(Math.random() * currentLevels.length);

  const row =
    document.getElementById(`row-${index}`);

  if (!row) return;

  document
    .querySelectorAll(".random-highlight")
    .forEach(el =>
      el.classList.remove("random-highlight")
    );

  row.classList.add("random-highlight");

  row.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

document
  .getElementById("top-btn")
  .addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
