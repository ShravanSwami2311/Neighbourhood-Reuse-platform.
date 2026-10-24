document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("post-item-form");
  if (!form) return;
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const message = document.getElementById("form-message");
    if (!getToken()) {
      message.textContent = "Please log in before posting a donation.";
      message.classList.add("error");
      setTimeout(() => { window.location.href = "login.html"; }, 900);
      return;
    }
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      await apiRequest("/items", { method: "POST", body: JSON.stringify(values) });
      message.textContent = "Donation posted successfully. Opening your dashboard…";
      form.reset();
      setTimeout(() => { window.location.href = "dashboard.html"; }, 900);
    } catch (error) {
      message.textContent = error.message;
      message.classList.add("error");
    }
  });
});
