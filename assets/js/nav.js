(function () {
  var toggle = document.querySelector('.nav-projects');
  var panel = document.getElementById('projects-panel');
  if (!toggle || !panel) return;
  function setOpen(open) {
    panel.classList.toggle('is-open', open);
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  toggle.addEventListener('click', function (e) {
    e.preventDefault();
    setOpen(!panel.classList.contains('is-open'));
  });
  panel.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    if (a.getAttribute('href') === '#') e.preventDefault();
    setOpen(false);
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-projects') && !e.target.closest('#projects-panel')) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
})();
