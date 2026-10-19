const root = document.documentElement;
try { root.dataset.theme = localStorage.getItem('rolling-stone-theme') || 'light'; } catch {}
const themeButton = document.querySelector('[data-theme-toggle]');
function updateThemeButton() {
  const dark = root.dataset.theme === 'dark';
  themeButton.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到深色模式');
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.querySelector('[data-theme-label]').textContent = dark ? '浅色' : '深色';
}
themeButton?.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('rolling-stone-theme', root.dataset.theme); } catch {}
  updateThemeButton();
});
if (themeButton) updateThemeButton();
const explorer = document.querySelector('[data-explorer]');
if (explorer) {
  const search = explorer.querySelector('[data-search]');
  const filters = [...explorer.querySelectorAll('[data-filter]')];
  const rows = [...explorer.querySelectorAll('[data-post]')];
  let active = 'all';
  const requested = new URLSearchParams(location.search).get('topic');
  if (filters.some(button => button.dataset.filter === requested)) active = requested;
  function filterPosts() {
    const query = search?.value.trim().toLocaleLowerCase() || '';
    let count = 0;
    rows.forEach(row => {
      const matches = (active === 'all' || row.dataset.category === active) && row.dataset.searchText.toLocaleLowerCase().includes(query);
      row.hidden = !matches;
      if (matches) count++;
    });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === active)));
    explorer.querySelector('[data-empty]').hidden = count !== 0;
    explorer.querySelector('[data-result]').textContent = `${count} 篇${active === 'all' && !query ? '' : '匹配'}笔记`;
  }
  filters.forEach(button => button.addEventListener('click', () => {
    active = button.dataset.filter;
    const next = new URL(location.href);
    active === 'all' ? next.searchParams.delete('topic') : next.searchParams.set('topic', active);
    try { history.replaceState(null, '', next); } catch {}
    filterPosts();
  }));
  search?.addEventListener('input', filterPosts);
  explorer.querySelector('[data-reset]')?.addEventListener('click', () => {
    active = 'all'; if (search) search.value = '';
    const next = new URL(location.href); next.searchParams.delete('topic'); try { history.replaceState(null, '', next); } catch {}
    filterPosts(); search?.focus();
  });
  filterPosts();
}
