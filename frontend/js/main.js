document.addEventListener("DOMContentLoaded", () => {
  const navAuth = document.getElementById("nav-auth");
  if (navAuth) {
    const user = JSON.parse(localStorage.getItem("nr_user") || "null");
    if (user) {
      navAuth.innerHTML = `<a href="dashboard.html">Hi, ${escapeHTML(user.name.split(" ")[0])}</a> <a href="#" id="logout-link">Log out</a>`;
      document.getElementById("logout-link").addEventListener("click", event => {
        event.preventDefault();
        clearSession();
        window.location.href = "index.html";
      });
    } else {
      navAuth.innerHTML = '<a href="login.html">Log in</a>';
    }
  }

  const featured = document.getElementById("featured-items");
  if (featured) loadFeaturedItems(featured);
});

async function loadFeaturedItems(container) {
  try {
    const data = await apiRequest("/items");
    const items = data.items.slice(0, 3);
    container.innerHTML = items.length
      ? items.map(renderItemCard).join("")
      : '<div class="empty-state">No donations yet. Be the first to share something useful.</div>';
  } catch {
    container.innerHTML = '<div class="empty-state">Could not load items. Make sure the backend is running.</div>';
  }
}

function renderItemCard(item) {
  const image = safeImageUrl(item.image_url || getCategoryImage(item.category));
  const imageMarkup = image
    ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(item.title)}" loading="lazy">`
    : '<div class="item-placeholder" aria-hidden="true">♻</div>';
  return `<article class="item-card">
    ${imageMarkup}
    <div class="item-card-body">
      <span class="tag">${escapeHTML(item.category)}</span>
      <h3>${escapeHTML(item.title)}</h3>
      <p>${escapeHTML((item.description || "").slice(0, 110))}${(item.description || "").length > 110 ? "…" : ""}</p>
      <p>📍 ${escapeHTML(item.location || "Location not provided")}</p>
      <p>Shared by ${escapeHTML(item.donor_name || "Community member")}</p>
      <div class="card-actions"><a class="button small-button" href="item-details.html?id=${encodeURIComponent(item.id)}">View details</a></div>
    </div></article>`;
}

function getCategoryImage(category) {
  const images = {
    Clothing: "photo-1490481651871-ab68de25d43d",
    Books: "photo-1494438639946-1ebd1d20bf85",
    Electronics: "photo-1496181133206-80ce9b88a853",
    Furniture: "photo-1555041469-a586c61ea9bc",
    Household: "photo-1586023492125-27b2c045efd7",
    Toys: "photo-1596461404969-9ae70f2830c1",
    Other: "photo-1513519245088-0e12902e5a38"
  };
  return `https://images.unsplash.com/${images[category] || images.Other}?auto=format&fit=crop&w=900&q=80`;
}
