document.addEventListener("DOMContentLoaded", () => {
  const yoldaList = document.getElementById("yoldaBirliklerListesi");
  const savasList = document.getElementById("savasRaporlariListesi");
  const casusList = document.getElementById("casuslukRaporlariListesi");

  // Boş liste mesajı ekleyelim (isteğe bağlı)
  yoldaList.innerHTML = "<li>Henüz yolda olan birlik yok.</li>";
  savasList.innerHTML = "<li>Henüz savaş raporu yok.</li>";
  casusList.innerHTML = "<li>Henüz casusluk raporu yok.</li>";
});
