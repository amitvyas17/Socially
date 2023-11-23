document.addEventListener("DOMContentLoaded", function() {
    const dropdown = document.querySelector(".custom-dropdown");
    const submenuToggle = document.querySelector("[href='#pageSubmenu']");

    submenuToggle.addEventListener("click", function() {
      dropdown.classList.toggle("show");
      alert('Hello')
    });
  });