document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("profile-form")) loadDashboard();
  const publicProfile = document.getElementById("public-profile");
  if (publicProfile) loadPublicProfile(publicProfile);
});

function requireLogin() {
  if (!getToken()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

async function loadDashboard() {
  if (!requireLogin()) return;
  const mainMessage = document.getElementById("dashboard-message");
  try {
    const [profile, myItems, sent, received] = await Promise.all([
      apiRequest("/users/me"), apiRequest("/items/mine"),
      apiRequest("/requests/sent"), apiRequest("/requests/received")
    ]);
    const form = document.getElementById("profile-form");
    ["name", "phone", "area"].forEach(key => { form.elements[key].value = profile.user[key] || ""; });
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const msg = document.getElementById("profile-message");
      const values = Object.fromEntries(new FormData(form).entries());
      try {
        await apiRequest("/users/me", { method: "PATCH", body: JSON.stringify(values) });
        msg.textContent = "Profile updated.";
        const user = JSON.parse(localStorage.getItem("nr_user") || "null");
        if (user) { user.name = values.name; localStorage.setItem("nr_user", JSON.stringify(user)); }
      } catch (error) { msg.textContent = error.message; msg.classList.add("error"); }
    });

    document.getElementById("my-items").innerHTML = myItems.items.length
      ? myItems.items.map(item => `<article class="item-card"><div class="item-card-body"><span class="tag">${escapeHTML(item.category)}</span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.location)}</p><p>Status: <span class="status">${escapeHTML(item.status)}</span></p><div class="card-actions">${item.status === "reserved" ? `<button class="button small-button" data-donated="${item.id}">Mark donated</button>` : ""}<button class="button button-light small-button" data-delete="${item.id}">Delete post</button></div></div></article>`).join("")
      : '<div class="empty-state">You have not posted any donations yet.</div>';

    document.getElementById("sent-requests").innerHTML = sent.requests.length
      ? sent.requests.map(r => `<article class="request-card"><div><strong>${escapeHTML(r.title)}</strong><p>Donor: ${escapeHTML(r.donor_name)} · ${escapeHTML(r.location)}</p><p class="status">Status: ${escapeHTML(r.status)}</p></div>${r.status === "pending" ? `<button class="button button-light small-button" data-cancel="${r.id}">Cancel request</button>` : ""}</article>`).join("")
      : '<div class="empty-state">You have not requested any items.</div>';

    document.getElementById("received-requests").innerHTML = received.requests.length
      ? received.requests.map(r => `<article class="request-card"><div><strong>${escapeHTML(r.title)}</strong><p>Requested by ${escapeHTML(r.requester_name)} (${escapeHTML(r.requester_email)})</p><p>${escapeHTML(r.message || "No message provided.")}</p><p class="status">Status: ${escapeHTML(r.status)}</p></div><div class="card-actions">${r.status === "pending" ? `<button class="button small-button" data-accept="${r.id}">Accept</button><button class="button button-light small-button" data-reject="${r.id}">Reject</button>` : ""}</div></article>`).join("")
      : '<div class="empty-state">No one has requested your donations yet.</div>';

    document.querySelectorAll("[data-delete]").forEach(button => button.addEventListener("click", () => performAction(button, `/items/${button.dataset.delete}`, "DELETE")));
    document.querySelectorAll("[data-donated]").forEach(button => button.addEventListener("click", () => performAction(button, `/items/${button.dataset.donated}/donated`, "PATCH", {})));
    document.querySelectorAll("[data-cancel]").forEach(button => button.addEventListener("click", () => performAction(button, `/requests/${button.dataset.cancel}/cancel`, "PATCH", {})));
    document.querySelectorAll("[data-accept]").forEach(button => button.addEventListener("click", () => performAction(button, `/requests/${button.dataset.accept}/status`, "PATCH", { status: "accepted" })));
    document.querySelectorAll("[data-reject]").forEach(button => button.addEventListener("click", () => performAction(button, `/requests/${button.dataset.reject}/status`, "PATCH", { status: "rejected" })));
  } catch (error) {
    mainMessage.textContent = error.message;
    mainMessage.classList.add("error");
  }
}

async function performAction(button, path, method, body) {
  if (!confirm("Are you sure you want to continue?")) return;
  try {
    await apiRequest(path, { method, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
    window.location.reload();
  } catch (error) { alert(error.message); }
}

async function loadPublicProfile(container) {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) { container.textContent = "No profile selected."; return; }
  try {
    const data = await apiRequest(`/users/${encodeURIComponent(id)}`);
    container.innerHTML = `<div class="public-profile-head"><p class="eyebrow">Community member</p><h1>${escapeHTML(data.user.name)}</h1><p>${escapeHTML(data.user.area || "Neighbourhood not provided")}</p></div><h2>Donation posts</h2><div class="item-grid">${data.items.length ? data.items.map(renderItemCard).join("") : '<div class="empty-state">No donation posts to display.</div>'}</div>`;
  } catch (error) { container.innerHTML = `<p class="form-message error">${escapeHTML(error.message)}</p>`; }
}
