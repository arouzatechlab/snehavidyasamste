document.addEventListener("DOMContentLoaded", () => {
  const ftrbacktotop = document.getElementById("ftrbacktotop");

  // Monitor scrolling depth to reveal/hide button
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      ftrbacktotop.classList.add("ftrshow");
    } else {
      ftrbacktotop.classList.remove("ftrshow");
    }
  });

  // Smooth scroll action back to top of document
  ftrbacktotop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
});
