const form = document.getElementById("loginForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = new FormData(form);
  const obj = {};
  data.forEach((value, key) => (obj[key] = value));

  fetch("/api/users/login", {
    method: "POST",
    body: JSON.stringify(obj),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(async (response) => {
      if (response.status != 200) {
        throw new Error("Invalid credentials");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Network response was not ok: ${response.status} ${response.statusText}`,
          errorData
        );
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      } else {
        return { status: "success" };
      }
    })
    .then((data) => {
      if (data) {
        alert("Login completed successfully!");
        window.location.replace("/");
      } else {
        alert(data.error || "Invalid credentials");
      }
    })
    .catch((error) => {
      alert("Invalid credentials. Please try again.");
    });
});

function register() {
  const targetHref = "/api/users/register";
  window.location.href = targetHref;
}
