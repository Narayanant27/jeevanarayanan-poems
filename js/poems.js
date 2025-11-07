let poems = [];
let poets = [];
let activeTag = null;
let selectedPoemId = null;

function parseTags(poem){
  if(!poem) return [];
  if(Array.isArray(poem.tags)) return poem.tags.map(t=>String(t).trim()).filter(Boolean);
  if(typeof poem.tags === 'string') return poem.tags.split(',').map(t=>t.trim()).filter(Boolean);
  return [];
}

async function initPoems(){
  poems = await fetchJSON('data/poems.json');
  poets = await fetchJSON('data/poets.json');

  // Normalize dates and sort newest first
  poems.forEach(p=>{ p._date = p.created_at ? new Date(p.created_at) : new Date(0); });
  poems.sort((a,b)=> b._date - a._date);

  buildTagGroups(poems);
  renderTitles(poems);

  if(poems.length>0){
    selectPoem(poems[0].id || 0);
  }

  // wire right-side search and sort
  const titleSearch = document.getElementById('titleSearchInput');
  if(titleSearch){
    titleSearch.addEventListener('input', ()=> applyFilters());
  }

  const titleSort = document.getElementById('titleSortSelect');
  if(titleSort){
    titleSort.addEventListener('change', ()=> applyFilters());
  }
}

function buildTagGroups(data){
  const tagMap = new Map();
  data.forEach(p=>{
    const tags = parseTags(p);
    if(tags.length===0){
      const key = 'Uncategorized';
      tagMap.set(key, (tagMap.get(key)||0)+1);
    }else{
      tags.forEach(t=> tagMap.set(t, (tagMap.get(t)||0)+1));
    }
  });

  const tagList = document.getElementById('tagList');
  if(!tagList) return;
  tagList.innerHTML = '';

  // All tag
  const allBtn = document.createElement('button');
  allBtn.className = 'tag-btn active';
  allBtn.textContent = `All (${data.length})`;
  allBtn.onclick = ()=>{ activeTag = null; document.querySelectorAll('.tag-btn').forEach(b=>b.classList.remove('active')); allBtn.classList.add('active'); applyFilters(); };
  tagList.appendChild(allBtn);

  // add tags sorted by count
  Array.from(tagMap.entries()).sort((a,b)=> b[1]-a[1]).forEach(([tag,count])=>{
    const btn = document.createElement('button');
    btn.className = 'tag-btn';
    btn.textContent = `${tag} (${count})`;
    btn.onclick = ()=>{
      activeTag = tag;
      document.querySelectorAll('.tag-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    };
    tagList.appendChild(btn);
  });
}

function applyFilters(){
  const q = (document.getElementById('titleSearchInput')?.value || '').toLowerCase();
  const sortVal = document.getElementById('titleSortSelect')?.value || 'newest';

  let result = poems.filter(p=>{
    if(activeTag){
      const tags = parseTags(p);
      if(!tags.includes(activeTag)) return false;
    }
    if(!q) return true;
    if((p.title||'').toLowerCase().includes(q)) return true;
    const body = Array.isArray(p.body) ? p.body.join(' ') : (p.body||'');
    if(body.toLowerCase().includes(q)) return true;
    return false;
  });

  if(sortVal==='a-z') result.sort((a,b)=> (a.title||'').localeCompare(b.title||''));
  else if(sortVal==='z-a') result.sort((a,b)=> (b.title||'').localeCompare(a.title||''));
  else if(sortVal==='oldest') result.sort((a,b)=> a._date - b._date);
  else result.sort((a,b)=> b._date - a._date);

  renderTitles(result);
}

function renderTitles(data){
  const titlesDiv = document.getElementById('titles');
  if(!titlesDiv) return;
  titlesDiv.innerHTML = '';
  // Render a flat list of poem titles (no grouping by tags on the left side)
  data.forEach(poem=>{
    const item = document.createElement('div');
    item.className = 'poem-item';
    item.dataset.id = poem.id || '';

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    if(poem.cover_image){
      const img = document.createElement('img');
      img.src = poem.cover_image;
      img.alt = poem.title || '';
      img.className = 'thumb-img';
      img.width = 44; img.height = 44;
      thumb.appendChild(img);
    }

    const metaWrap = document.createElement('div'); metaWrap.className='meta-wrap';
    const titleEl = document.createElement('div'); titleEl.className='title'; titleEl.textContent = poem.title || 'Untitled';
    const subEl = document.createElement('div'); subEl.className='sub'; subEl.textContent = poem.created_at || '';
    metaWrap.appendChild(titleEl); metaWrap.appendChild(subEl);

    item.appendChild(thumb); item.appendChild(metaWrap);
    item.onclick = ()=> selectPoem(poem.id);

    if(String(poem.id) === String(selectedPoemId)) item.classList.add('active');
    titlesDiv.appendChild(item);
  });
}

function selectPoem(id){
  const poem = poems.find(p=> String(p.id) === String(id));
  if(!poem) return;
  selectedPoemId = id;
  showPoemDetail(poem);

  // highlight in list
  document.querySelectorAll('.poem-item').forEach(el=>{
    el.classList.toggle('active', el.dataset.id === String(id));
    if(el.dataset.id === String(id)) el.scrollIntoView({behavior:'smooth', block:'center'});
  });
}

function showPoemDetail(poem){
  const poet = poets.find(p => p.id === poem.poet_id);
  const detail = document.getElementById('poemDetail');
  const poemBody = Array.isArray(poem.body) ? poem.body.join('\n') : (poem.body || '');

  detail.innerHTML = `\n    <div class="poem-card">\n      <h2>${poem.title || ''}</h2>\n      <p class="meta"><strong>✍️ ${poet ? poet.name : 'அறியப்படாதவர்'}</strong> • ${poem.created_at || ''}</p>\n      \n      <div class="poem-body">${poemBody.replace(/\n/g,'<br>')}</div>\n    </div>\n  `;
}

// start
initPoems();
