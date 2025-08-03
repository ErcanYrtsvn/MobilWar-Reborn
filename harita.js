
let map = document.getElementById("map-container");
let popup = document.getElementById("popup");

let isDragging = false, startX, startY, scrollLeft, scrollTop;

map.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = e.pageX - map.offsetLeft;
  startY = e.pageY - map.offsetTop;
  map.style.cursor = "grabbing";
});

map.addEventListener("mouseup", () => {
  isDragging = false;
  map.style.cursor = "grab";
});

map.addEventListener("mouseleave", () => {
  isDragging = false;
  map.style.cursor = "grab";
});

map.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  e.preventDefault();
  const x = e.pageX - map.offsetLeft;
  const y = e.pageY - map.offsetTop;
  map.scrollLeft -= x - startX;
  map.scrollTop -= y - startY;
});

document.querySelectorAll(".tile").forEach(tile => {
  tile.addEventListener("click", (e) => {
    popup.style.left = e.pageX + "px";
    popup.style.top = e.pageY + "px";
    popup.classList.remove("hidden");
  });
});

function closePopup() {
  popup.classList.add("hidden");
}
