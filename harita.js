const mapContainer = document.getElementById("mapContainer");
const koordinatDiv = document.getElementById("koordinatlar");

window.onload = function () {
    window.scrollTo(1500 - window.innerWidth / 2, 1500 - window.innerHeight / 2);
    guncelleKonum();
};

mapContainer.addEventListener("mousemove", function (e) {
    const x = e.pageX;
    const y = e.pageY;
    koordinatDiv.textContent = `X: ${x}, Y: ${y}`;
});

function konumaGit() {
    window.scrollTo(1500 - window.innerWidth / 2, 1500 - window.innerHeight / 2);
}

function guncelleKonum() {
    const x = window.scrollX + window.innerWidth / 2;
    const y = window.scrollY + window.innerHeight / 2;
    koordinatDiv.textContent = `X: ${Math.floor(x)}, Y: ${Math.floor(y)}`;
}

window.addEventListener("scroll", guncelleKonum);
