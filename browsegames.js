function loadBrowseGames() {
  fetch("games.json")
    .then(res => res.text())
    .then(text => JSON.parse(text))
    .then(games => {
      const grid = document.getElementById("browse-grid")

      const items = games
        .sort(() => Math.random() - 0.5)

      grid.innerHTML = items.map(g => `
        <div class="game-card" data-name="${g.name}">
          <img src="${g.main_image_url}" alt="">
          <div class="game-card-info">
            <h3>${g.name}</h3>
            <p class="secondary-text">${g.description}</p>
            <div class="genre-container">
              ${g.genres.map(genre => `<p class="genre-badge">${genre}</p>`).join("")}
            </div>
          </div>
        </div>
      `).join("")

      document.querySelectorAll(".game-card").forEach(card => {
        card.onclick = () => {
          const name = card.dataset.name
          window.location.href = `details.html?game=${encodeURIComponent(name)}`
        }
      })
    })
    .catch(err => console.error("Failed to load games:", err))
}

loadBrowseGames()
