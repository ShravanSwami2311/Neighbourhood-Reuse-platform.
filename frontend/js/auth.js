document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");
  if (registerForm) registerForm.addEventListener("submit", handleRegister);
  if (loginForm) loginForm.addEventListener("submit", handleLogin);
});

function showAuthMessage(message, isError = false) {
  const element = document.getElementById("form-message");
  if (!element) return;
  element.textContent = message;
  element.classList.toggle("error", isError);
}

async function handleRegister(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const values = Object.fromEntries(new FormData(form).entries());
  try {
    const data = await apiRequest("/auth/register", { method: "POST", body: JSON.stringify(values) });
    saveSession(data);
    showAuthMessage("Account created. Redirecting…");
    window.location.href = "dashboard.html";
  } catch (error) {
    showAuthMessage(error.message, true);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget).entries());
  try {
    const data = await apiRequest("/auth/login", { method: "POST", body: JSON.stringify(values) });
    saveSession(data);
    showAuthMessage("Login successful. Redirecting…");
    window.location.href = "dashboard.html";
  } catch (error) {
    showAuthMessage(error.message, true);
  }
}
