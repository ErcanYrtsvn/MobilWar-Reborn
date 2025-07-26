function goTo(screenId) {
  document.querySelectorAll('.screen').forEach(div => div.classList.add('hidden'));
  document.querySelector('.menu').classList.add('hidden');
  document.getElementById(screenId).classList.remove('hidden');
}
function goHome() {
  document.querySelectorAll('.screen').forEach(div => div.classList.add('hidden'));
  document.querySelector('.menu').classList.remove('hidden');
}
