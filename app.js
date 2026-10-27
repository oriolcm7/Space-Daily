const grid = document.getElementById('newsGrid');
const search = document.getElementById('searchInput');
const empty = document.getElementById('emptyState');
const archiveList = document.getElementById('archiveList');
const statusNotice = document.getElementById('statusNotice');
const editionStatus = document.getElementById('editionStatus');
let activeFilter = 'Todas';
let articles = [];
let editions = [];
let currentEdition = null;
const icons = {'Ingeniería':'⌘','Lanzadores':'↗','Satélites':'◉','Misiones':'⌁','Industria':'▤'};
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function formatDate(value, withYear = false) {
  if (!value) return 'FECHA NO DISPONIBLE';
  const d = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short',...(withYear?{year:'numeric'}:{})}).format(d).toUpperCase();
}
function render() {
  const q = search.value.trim().toLowerCase();
  const list = articles.filter(a => (activeFilter === 'Todas' || a.category === activeFilter) && (`${a.title} ${a.summary} ${a.category} ${a.source}`).toLowerCase().includes(q));
  grid.innerHTML = list.map((a,i) => `<article class="news-card"><div class="news-visual"><span class="visual-label">${escapeHTML(a.label || a.source || 'SPACE NEWS')}</span><span class="visual-icon">${icons[a.category] || '✦'}</span><span class="visual-no">DSN / ${String(i+1).padStart(2,'0')}</span></div><div class="news-body"><div class="meta-row"><span class="category-tag">${escapeHTML(a.category || 'Espacio')}</span><span class="news-date">${escapeHTML(formatDate(a.published))}</span></div><h3>${escapeHTML(a.title)}</h3><p>${escapeHTML(a.summary || 'La fuente no ofrece una descripción. Abre el artículo original para consultar todos los detalles.')}</p><div class="card-bottom"><span class="reading-time">${escapeHTML(a.source || 'Fuente RSS')}</span><a class="text-link" href="${escapeHTML(a.url)}" target="_blank" rel="noopener noreferrer">Leer fuente <span>↗</span></a></div></div></article>`).join('');
  empty.classList.toggle('hidden', list.length > 0);
  empty.textContent = articles.length ? 'No hay noticias que coincidan. Prueba con otra búsqueda o categoría.' : 'Todavía no hay una edición guardada. En GitHub, abre Actions → Update Daily Space News → Run workflow para recopilar la primera edición.';
}
async function loadEdition(file, date) {
  editionStatus.textContent = `EDICIÓN ${formatDate(date || file.replace('.json',''), true)}`;
  try {
    const response = await fetch(`editions/${encodeURIComponent(file)}?v=${Date.now()}`, {cache:'no-store'});
    if (!response.ok) throw new Error('No existe esa edición');
    const data = await response.json();
    currentEdition = data;
    articles = Array.isArray(data.articles) ? data.articles : [];
    render();
    document.getElementById('todayDate').textContent = formatDate(data.date || date, true);
    if (data.note) statusNotice.innerHTML = `<strong>Edición RSS</strong> · ${escapeHTML(data.note)}`;
    else statusNotice.innerHTML = '<strong>Edición RSS</strong> · Titulares y descripciones procedentes de los feeds originales. Consulta cada fuente para leer la noticia completa.';
    editionStatus.textContent = `EDICIÓN ${formatDate(data.date || date, true)} · ${articles.length} NOTICIAS`;
  } catch (e) {
    articles = []; render();
    statusNotice.innerHTML = '<strong>Esperando la primera edición</strong> · La recopilación se ejecuta automáticamente cada día. También puedes iniciarla manualmente desde la pestaña Actions de GitHub.';
  }
}
function renderArchive() {
  if (!editions.length) {
    archiveList.innerHTML = '<span class="archive-icon">▤</span><div><strong>Tu hemeroteca está preparada</strong><p>Cuando se genere la primera edición, aparecerá aquí. Cada día se guardará en un archivo independiente.</p></div>';
    return;
  }
  archiveList.className = 'archive-items';
  archiveList.innerHTML = editions.map(e => `<button class="archive-entry" data-file="${escapeHTML(e.file)}" data-date="${escapeHTML(e.date)}"><span class="archive-icon">▤</span><span class="archive-entry-copy"><strong>${escapeHTML(formatDate(e.date,true))}</strong><small>${Number(e.article_count)||0} noticias guardadas</small></span><span class="archive-arrow">↗</span></button>`).join('');
  archiveList.querySelectorAll('.archive-entry').forEach(btn => btn.addEventListener('click', () => { loadEdition(btn.dataset.file, btn.dataset.date); window.scrollTo({top:document.querySelector('.section-heading').offsetTop-20,behavior:'smooth'}); }));
}
async function init() {
  const now = new Date();
  document.getElementById('todayDate').textContent = new Intl.DateTimeFormat('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(now).toUpperCase();
  try {
    const response = await fetch(`editions/index.json?v=${Date.now()}`, {cache:'no-store'});
    if (response.ok) {
      const data = await response.json(); editions = Array.isArray(data.editions) ? data.editions : [];
    }
  } catch (_) {}
  renderArchive();
  if (editions.length) await loadEdition(editions[0].file, editions[0].date);
  else { articles=[]; render(); }
}
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach(item => item.classList.toggle('active', item === button));
  render();
}));
search.addEventListener('input', render);
document.getElementById('latestEdition').addEventListener('click', () => { if (editions.length) loadEdition(editions[0].file, editions[0].date); });
document.getElementById('themeToggle').addEventListener('click', () => document.body.classList.toggle('dark-mode'));
// Retain the technical concept panel from the prototype.
document.getElementById('conceptMore').addEventListener('click', () => {
  const el = document.getElementById('conceptExtra'); el.classList.toggle('hidden');
  document.getElementById('conceptMore').innerHTML = el.classList.contains('hidden') ? 'Explícamelo con un ejemplo <span>→</span>' : 'Ocultar explicación <span>↑</span>';
});
init();
