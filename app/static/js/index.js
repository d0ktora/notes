async function search(input){

}

document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.querySelector('.search');
    if(searchBar){
        searchBar.querySelector('i').addEventListener('click', () => search(searchBar));
        searchBar.querySelector('input').addEventListener('keydown', (e) => {
            if(e.key === 'Enter')
                search(searchBar);
        });
    }

  const searchInput = document.getElementById('search-input');
  const resultsContainer = document.getElementById('search-results');
  let debounceTimeout = null;

  function debounce(fn, delay = 300) {
    return function (...args) {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  async function searchWriteups(query) {
    if (!query.trim()) {
      resultsContainer.innerHTML = '';
      return;
    }

    resultsContainer.innerHTML = '<span class="loader"></span>';
    const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
    const results = await response.json();

    resultsContainer.innerHTML = '';
    if(results.length < 1){
            resultsContainer.innerHTML = '<div class="no-results">No results...</div>';
        }

    results.forEach(doc => {
      const item = document.createElement('a');
      item.className = 'search-result';
        item.style.display = 'block';
            item.style.textDecoration = 'none';
            item.href = '/doc/'+doc.id;

      const title = highlightText(doc.title, query);
      const tags = highlightText(doc.tags, query);
      const excerpt = doc.excerpt ? highlightText(doc.excerpt, query) : null;

      item.innerHTML = `
        <h2>${title}</h2>
        <p><strong>Tags:</strong> ${tags}</p>
        ${excerpt ? `<p class="excerpt">${excerpt}</p>` : ''}
      `;

      resultsContainer.appendChild(item);
    });
  }

  // Highlight all matches (case-insensitive)
function highlightText(text, query) {
  if (!text || !query) return text;

  // Handle " + " as separator (with space on both sides)
  const terms = query.includes(' + ')
    ? query.split(' + ').map(term => term.trim()).filter(Boolean)
    : [query.trim()];

  // Escape special RegExp characters and create regex
  const escapedTerms = terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');

  return text.replace(regex, match => `<mark>${match}</mark>`);
}

  // Bind with debounce
  searchInput?.addEventListener('input', debounce((e) => {
    searchWriteups(e.target.value);
  }, 300));

});
