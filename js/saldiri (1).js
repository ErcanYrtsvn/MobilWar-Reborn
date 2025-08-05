
document.addEventListener("DOMContentLoaded", () => {
  const yoldaList = document.getElementById("yoldaBirliklerListesi");
  const savasList = document.getElementById("savasRaporlariListesi");
  const casusList = document.getElementById("casuslukRaporlariListesi");

  if (yoldaList) {
    yoldaList.innerHTML = "<li>Henüz yolda olan birlik yok.</li>";
  }

  if (savasList) {
    savasList.innerHTML = "<li>Henüz savaş raporu yok.</li>";
  }

  if (casusList) {
    casusList.innerHTML = "<li>Henüz casusluk raporu yok.</li>";
  }
});
