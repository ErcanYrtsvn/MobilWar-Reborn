
let map = document.getElementById("mapContainer"); // Düzeltilmiş ID
let isDragging = false;
let startX, startY, scrollLeft, scrollTop;

map.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.pageX - map.offsetLeft;
    startY = e.pageY - map.offsetTop;
    scrollLeft = map.scrollLeft;
    scrollTop = map.scrollTop;
});

map.addEventListener("mouseleave", () => {
    isDragging = false;
});

map.addEventListener("mouseup", () => {
    isDragging = false;
});

map.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - map.offsetLeft;
    const y = e.pageY - map.offsetTop;
    const walkX = x - startX;
    const walkY = y - startY;
    map.scrollLeft = scrollLeft - walkX;
    map.scrollTop = scrollTop - walkY;
});
