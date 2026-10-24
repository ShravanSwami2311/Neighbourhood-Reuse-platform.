document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("search-form");
  const list = document.getElementById("item-list");
  if (searchForm && list) {
    searchForm.addEventListener("submit", event => {
      event.preventDefault();
      loadItems(list, Object.fromEntries(new FormData(searchForm).entries()));
    });
    loadItems(list, {});
  }
  const detail = document.getElementById("item-detail");
  if (detail) loadItemDetails(detail);
});

async function loadItems(container, filters) {
  const message = document.getElementById("browse-message");
  container.innerHTML = '<div class="empty-state">Loading donations…</div>';
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value && value.trim()) params.set(key, value.trim()); });
  try {
    const data = await apiRequest(`/items?${params.toString()}`);
    container.innerHTML = data.items.length
      ? data.items.map(renderItemCard).join("")
      : '<div class="empty-state">No matching donations found. Try a different search.</div>';
    if (message) message.textContent = `${data.items.length} item(s) found.`;
  } catch (error) {
    container.innerHTML = '<div class="empty-state">Could not load donations. Please check that the backend and database are running.</div>';
    if (message) { message.textContent = error.message; message.classList.add("error"); }
  }
}

async function loadItemDetails(container) {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) { container.innerHTML = '<p class="form-message error">No item selected. Return to Browse items.</p>'; return; }
  try {
    const { item } = await apiRequest(`/items/${encodeURIComponent(id)}`);
    const image = safeImageUrl(item.image_url || getCategoryImage(item.category));
    const picture = image ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(item.title)}">` : '<div class="detail-placeholder">♻</div>';
    const ownItem = JSON.parse(localStorage.getItem("nr_user") || "null")?.id === item.user_id;
    container.innerHTML = `<div>${picture}</div><div class="detail-copy">
      <span class="tag">${escapeHTML(item.category)}</span><h1>${escapeHTML(item.title)}</h1>
      <p>${escapeHTML(item.description)}</p><p><strong>Condition:</strong> ${escapeHTML(item.item_condition)}</p>
      <p><strong>Location:</strong> ${escapeHTML(item.location)}</p><p><strong>Donor:</strong> ${escapeHTML(item.donor_name)}</p>
      <p><strong>Status:</strong> <span class="status">${escapeHTML(item.status)}</span></p>
      ${item.status === "available" && !ownItem ? `<form id="request-form"><label>Message to donor (optional)<textarea name="message" rows="3" maxlength="500" placeholder="Briefly explain why you would like this item"></textarea></label><button class="button" type="submit">Request this item</button><p id="request-message" class="form-message" role="status"></p></form>` : ""}
      ${!getToken() && item.status === "available" ? '<p><a href="login.html">Log in</a> to request this item.</p>' : ""}
    </div>`;
    const form = document.getElementById("request-form");
    if (form) form.addEventListener("submit", async event => {
      event.preventDefault();
      const msg = document.getElementById("request-message");
      try {
        const values = Object.fromEntries(new FormData(form).entries());
        await apiRequest("/requests", { method: "POST", body: JSON.stringify({ item_id: item.id, message: values.message }) });
        msg.textContent = "Request sent! You can follow its status in your dashboard.";
        form.querySelector("button").disabled = true;
      } catch (error) { msg.textContent = error.message; msg.classList.add("error"); }
    });
  } catch (error) {
    container.innerHTML = `<p class="form-message error">${escapeHTML(error.message)}</p>`;
  }
}
