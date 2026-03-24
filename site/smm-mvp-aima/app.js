const state = {
  currentDate: new Date(2026, 2, 24),
  selectedDate: '2026-03-24',
  activeFilter: 'all',
  rubrics: ['Експертний', 'Продаючий', 'Кейс', 'Лайфстайл', 'Відгук'],
  placements: ['Instagram Post', 'Instagram Story', 'Facebook', 'TikTok', 'Telegram'],
  formats: ['Статичний пост', 'Карусель', 'Reels', 'Story', 'Текстовий пост'],
  topics: [
    '5 помилок, які вбивають охоплення',
    'Як підготувати контент-план на місяць',
    'Що постити, коли немає ідей',
    'Кейс клієнта: до/після',
    'Як оформити продаючий Reels',
    'Чому рубрика важливіша за тренди'
  ],
  meetings: [
    { title: 'План контенту на квітень', date: '2026-03-20', notes: 'Акцент на прогрів до запуску. Потрібні кейси, behind the scenes, серія корисних постів і контент про біль клієнта.' }
  ],
  holidays: {
    '2026-01-01': 'Новий рік — підбірка підсумків, плани, акції.',
    '2026-02-14': 'День закоханих — романтичні офери, подарунки, емоційний контент.',
    '2026-03-08': '8 березня — тематичні підбірки, подарункові рішення, турбота.',
    '2026-04-12': 'Великдень — святкові пропозиції, підбірки, візуали з пасхальним настроєм.',
    '2026-05-10': 'День матері — емоційні історії, добірки, спецпропозиції.',
    '2026-06-01': 'День захисту дітей — сімейний та дитячий контент.',
    '2026-08-24': 'День Незалежності — українські сенси, патріотичний контент.',
    '2026-11-27': 'Black Friday — акції, дедлайни, офери, каруселі з пропозиціями.',
    '2026-12-19': 'Святий Миколай — подарункові добірки, теплий контент.',
    '2026-12-31': 'Передноворічний контент — підсумки, акції, плани на новий рік.'
  },
  posts: {
    '2026-03-04': [{ topic: 'Кейс клієнта: до/після', placement: 'Instagram Post', rubric: 'Кейс', format: 'Статичний пост', status: 'done' }],
    '2026-03-07': [{ topic: 'Як підготувати контент-план на місяць', placement: 'Telegram', rubric: 'Експертний', format: 'Текстовий пост', status: 'draft' }],
    '2026-03-12': [{ topic: 'Що постити, коли немає ідей', placement: 'Instagram Story', rubric: 'Лайфстайл', format: 'Story', status: 'gen' }],
    '2026-03-24': [{ topic: '5 помилок, які вбивають охоплення', placement: 'Instagram Post', rubric: 'Експертний', format: 'Карусель', status: 'draft' }],
    '2026-04-02': [{ topic: 'Як оформити продаючий Reels', placement: 'TikTok', rubric: 'Продаючий', format: 'Reels', status: 'done' }]
  }
};

const monthNames = ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];
const monthNamesGen = ['січня','лютого','березня','квітня','травня','червня','липня','серпня','вересня','жовтня','листопада','грудня'];
const placementSizes = {
  'Instagram Post': '1080×1350',
  'Instagram Story': '1080×1920',
  'Facebook': '1200×1500',
  'TikTok': '1080×1920',
  'Telegram': '1280×1280'
};

function pad(n){ return String(n).padStart(2,'0'); }
function dateKey(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function humanDate(str){ const d=new Date(str); return `${d.getDate()} ${monthNamesGen[d.getMonth()]} ${d.getFullYear()}`; }
function statusLabel(status){ return status==='done' ? 'Затверджено' : status==='gen' ? 'Згенеровано' : 'Чернетка'; }
function getHolidayHint(dateStr){ return state.holidays[dateStr] || 'Немає рекомендації'; }
function countHolidayMatches(year, month){ return Object.keys(state.holidays).filter(k=>{ const d=new Date(k); return d.getFullYear()===year && d.getMonth()===month; }).length; }
function countAllPosts(){ return Object.values(state.posts).reduce((acc, arr)=>acc + arr.length, 0); }
function countDrafts(){ return Object.values(state.posts).flat().filter(p=>p.status==='draft').length; }

function saveState(){ localStorage.setItem('aima-smm-mvp', JSON.stringify(state)); }
function loadState(){
  const saved = localStorage.getItem('aima-smm-mvp');
  if(!saved) return;
  try {
    const parsed = JSON.parse(saved);
    Object.assign(state, parsed);
    state.currentDate = new Date(parsed.currentDate);
  } catch {}
}

function navigate(page){
  if (page === 'calendar') window.location.href = './index.html';
  if (page === 'settings') window.location.href = './settings.html';
  if (page === 'topics') window.location.href = './topics.html';
  if (page === 'meetings') window.location.href = './meetings.html';
}

function bindNav(){
  document.querySelectorAll('[data-nav]').forEach(btn => btn.addEventListener('click', () => navigate(btn.dataset.nav)));
}

function enableEnterSubmit(formId, handler){
  const form = document.getElementById(formId);
  if(!form) return;
  form.addEventListener('submit', (e)=>{ e.preventDefault(); handler(); });
}

function renderSidebar(active){
  const menu = document.getElementById('sidebarMenu');
  if(!menu) return;
  const items = [
    ['calendar','Контент-календар'],
    ['topics','Теми'],
    ['meetings','Наради'],
    ['settings','Рубрики / плейсменти / формати']
  ];
  menu.innerHTML = items.map(([key,label]) => `<button class="side-link ${active===key?'active':''}" data-nav="${key}">${label}</button>`).join('');
  bindNav();
}

function renderHeader(title, subtitle='Aima SMM Planner'){ 
  const titleNode = document.getElementById('pageTitle');
  const subNode = document.getElementById('pageSubtitle');
  if(titleNode) titleNode.textContent = title;
  if(subNode) subNode.textContent = subtitle;
}

function fillSelect(id, items){
  const el = document.getElementById(id);
  if(!el) return;
  el.innerHTML = items.map(item=>`<option value="${item}">${item}</option>`).join('');
}

function bindCollection(key, listId, inputId, addId, afterRender = ()=>{}, renderer){
  const render = ()=>{
    const list = document.getElementById(listId);
    if(!list) return;
    list.innerHTML = (renderer ? renderer(state[key]) : state[key].map((item, idx) => `
      <div class="setting-row">
        <span>${item}</span>
        <div class="row-actions">
          <button class="mini-btn" data-edit="${idx}">Редагувати</button>
          <button class="mini-btn danger" data-remove="${idx}">Видалити</button>
        </div>
      </div>`).join(''));
    list.querySelectorAll('[data-remove]').forEach(btn=>btn.addEventListener('click', ()=>{ state[key].splice(Number(btn.dataset.remove),1); saveState(); render(); afterRender(); }));
    list.querySelectorAll('[data-edit]').forEach(btn=>btn.addEventListener('click', ()=>{
      const idx = Number(btn.dataset.edit);
      const current = state[key][idx];
      const next = prompt('Нове значення', typeof current === 'string' ? current : current.title || current.name || '');
      if(next){
        if(typeof current === 'string') state[key][idx] = next;
        else if(current.title) state[key][idx].title = next;
        else if(current.name) state[key][idx].name = next;
        saveState(); render(); afterRender();
      }
    }));
  };
  const add = ()=>{
    const input = document.getElementById(inputId);
    const value = input?.value.trim();
    if(!value) return;
    state[key].push(value);
    input.value='';
    saveState(); render(); afterRender();
  };
  const btn = document.getElementById(addId);
  if(btn && !btn.dataset.boundClick){ btn.dataset.boundClick='1'; btn.addEventListener('click', (e)=>{ if(btn.type!=='submit') { e.preventDefault(); add(); } }); }
  enableEnterSubmit(btn?.form?.id, add);
  render();
}

function applyPlacementSize(placement){
  const box = document.getElementById('previewBox');
  const size = placementSizes[placement] || '1080×1350';
  if(document.getElementById('visualSize')) document.getElementById('visualSize').textContent = `Рекомендований розмір: ${size}`;
  if(box) box.style.aspectRatio = placement.includes('Story') || placement === 'TikTok' ? '9 / 16' : placement === 'Telegram' ? '1 / 1' : '4 / 5';
}

function generateTopicsFromMeetings(){
  const ideas = [];
  state.meetings.forEach(meeting => {
    const text = `${meeting.title} ${meeting.notes}`.toLowerCase();
    if(text.includes('кейс')) ideas.push('Кейс: як ми отримали результат для клієнта');
    if(text.includes('прогрів')) ideas.push('Серія прогрівочних постів перед запуском');
    if(text.includes('біль')) ideas.push('3 болі клієнта, які заважають купити зараз');
    if(text.includes('вебінар')) ideas.push('Як підготувати аудиторію до вебінару через контент');
    if(text.includes('курс')) ideas.push('Що реально дає курс і кому він підходить');
    if(text.includes('акці')) ideas.push('Як подати акційну пропозицію без дешевого вигляду');
    if(text.includes('закуліс')) ideas.push('Закулісся процесу: як ми готуємо продукт / послугу');
    if(text.includes('контент')) ideas.push('Контент-план на тиждень: що постити по днях');
  });
  const unique = [...new Set(ideas)].filter(Boolean);
  return unique.length ? unique : ['Розбір запиту клієнта: що стоїть за покупкою', 'Як вибудувати контент, який веде до заявки', 'Поширені помилки у комунікації бренду'];
}

function renderCalendarPage(){
  renderSidebar('calendar');
  renderHeader('Контент-календар', 'Aima • SMM Planner MVP');
  document.getElementById('statPosts').textContent = countAllPosts();
  document.getElementById('statTopics').textContent = state.topics.length;
  document.getElementById('statHolidays').textContent = countHolidayMatches(state.currentDate.getFullYear(), state.currentDate.getMonth());
  document.getElementById('statDrafts').textContent = countDrafts();

  const currentMonthEl = document.getElementById('currentMonth');
  const weekdays = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];
  document.getElementById('weekdays').innerHTML = weekdays.map(d=>`<div class="weekday">${d}</div>`).join('');

  function currentDraft(){
    const prev = (state.posts[state.selectedDate]||[])[0] || {};
    return {
      topic: document.getElementById('customTopic').value || document.getElementById('topicPreset').value,
      rubric: document.getElementById('rubricSelect').value,
      placement: document.getElementById('placementSelect').value,
      format: document.getElementById('formatSelect').value,
      text: document.getElementById('generatedText').value,
      image: prev.image || null,
      status: 'draft'
    };
  }

  function fillEditor(){
    const post = (state.posts[state.selectedDate]||[])[0] || { topic:'', placement: state.placements[0], rubric: state.rubrics[0], format: state.formats[0], status:'draft', image:null };
    document.getElementById('selectedDate').textContent = humanDate(state.selectedDate);
    document.getElementById('postDate').value = state.selectedDate;
    document.getElementById('holidayHint').textContent = getHolidayHint(state.selectedDate);
    fillSelect('topicPreset', state.topics);
    document.getElementById('customTopic').value = post.topic || '';
    fillSelect('rubricSelect', state.rubrics);
    fillSelect('placementSelect', state.placements);
    fillSelect('formatSelect', state.formats);
    document.getElementById('rubricSelect').value = post.rubric || state.rubrics[0];
    document.getElementById('placementSelect').value = post.placement || state.placements[0];
    document.getElementById('formatSelect').value = post.format || state.formats[0];
    document.getElementById('generatedText').value = post.text || '';
    document.getElementById('imageTitle').textContent = post.topic || 'Новий контент';
    document.getElementById('imageDesc').textContent = `Плейсмент: ${post.placement || state.placements[0]} • Формат: ${post.format || state.formats[0]}`;
    const badge = document.getElementById('statusBadge');
    badge.className = `status-badge ${post.status || 'draft'}`;
    badge.textContent = statusLabel(post.status || 'draft');
    applyPlacementSize(post.placement || state.placements[0]);
    const img = document.getElementById('uploadedPreview');
    if(post.image){ img.src = post.image; img.classList.remove('hidden'); } else { img.src=''; img.classList.add('hidden'); }
  }

  function drawFilters(){
    const filterEl = document.getElementById('filters');
    const list = [{id:'all',label:'Всі'}, ...state.placements.map(p=>({id:p,label:p}))];
    filterEl.innerHTML = list.map(item => `<button class="chip ${state.activeFilter===item.id?'active':''}" data-filter="${item.id}">${item.label}</button>`).join('');
    filterEl.querySelectorAll('button').forEach(btn=>btn.addEventListener('click', ()=>{ state.activeFilter=btn.dataset.filter; saveState(); drawFilters(); drawCalendar(); }));
  }

  function drawCalendar(){
    const grid = document.getElementById('calendarGrid');
    const y = state.currentDate.getFullYear();
    const m = state.currentDate.getMonth();
    currentMonthEl.textContent = `${monthNames[m]} ${y}`;
    document.getElementById('statHolidays').textContent = countHolidayMatches(y,m);
    grid.innerHTML = '';
    const first = new Date(y,m,1);
    const days = new Date(y,m+1,0).getDate();
    const firstDay = (first.getDay()+6)%7;
    for(let i=0;i<firstDay;i++) grid.innerHTML += `<div class="day empty"></div>`;
    for(let day=1; day<=days; day++){
      const date = new Date(y,m,day);
      const key = dateKey(date);
      const posts = state.posts[key] || [];
      const filtered = state.activeFilter==='all' ? posts : posts.filter(p=>p.placement===state.activeFilter);
      const selected = key===state.selectedDate ? 'selected' : '';
      const holiday = state.holidays[key] ? `<div class="post-pill gen"><strong>🎉 Рекомендація</strong><span>${state.holidays[key].slice(0,36)}...</span></div>` : '';
      grid.innerHTML += `<div class="day ${selected}" data-date="${key}"><div class="day-head"><span class="day-num">${day}</span><button class="icon-btn add-post" data-date="${key}" type="button">+</button></div><div class="day-posts">${holiday}${filtered.slice(0,2).map(post=>`<div class="post-pill ${post.status||'draft'}"><strong>${post.topic}</strong><span>${post.placement}</span></div>`).join('')}</div></div>`;
    }
    grid.querySelectorAll('.day[data-date]').forEach(el=>el.addEventListener('click', (e)=>{ if(e.target.classList.contains('add-post')) return; state.selectedDate = el.dataset.date; saveState(); drawCalendar(); fillEditor(); }));
    grid.querySelectorAll('.add-post').forEach(btn=>btn.addEventListener('click', (e)=>{ e.stopPropagation(); state.selectedDate = btn.dataset.date; saveState(); fillEditor(); drawCalendar(); document.getElementById('customTopic').focus(); }));
  }

  function savePost(status='draft'){
    const draft = currentDraft();
    draft.status = status;
    state.posts[state.selectedDate] = [draft];
    saveState();
    fillEditor();
    drawCalendar();
    document.getElementById('statPosts').textContent = countAllPosts();
    document.getElementById('statDrafts').textContent = countDrafts();
  }

  document.getElementById('prevMonth').addEventListener('click', ()=>{ state.currentDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth()-1, 1); saveState(); drawCalendar(); });
  document.getElementById('nextMonth').addEventListener('click', ()=>{ state.currentDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth()+1, 1); saveState(); drawCalendar(); });
  document.getElementById('usePreset').addEventListener('click', ()=>{ document.getElementById('customTopic').value = document.getElementById('topicPreset').value; });
  document.getElementById('placementSelect').addEventListener('change', (e)=>{ applyPlacementSize(e.target.value); document.getElementById('imageDesc').textContent = `Плейсмент: ${e.target.value} • Формат: ${document.getElementById('formatSelect').value}`; });
  document.getElementById('formatSelect').addEventListener('change', (e)=>{ document.getElementById('imageDesc').textContent = `Плейсмент: ${document.getElementById('placementSelect').value} • Формат: ${e.target.value}`; });
  document.getElementById('generateText').addEventListener('click', ()=>{
    const topic = document.getElementById('customTopic').value || document.getElementById('topicPreset').value;
    const rubric = document.getElementById('rubricSelect').value;
    const placement = document.getElementById('placementSelect').value;
    const format = document.getElementById('formatSelect').value;
    const holiday = getHolidayHint(state.selectedDate);
    const size = placementSizes[placement] || '1080×1350';
    const meetingsContext = state.meetings.slice(-3).map(m=>`${m.title}: ${m.notes}`).join(' | ');
    document.getElementById('generatedText').value = `Дата публікації: ${humanDate(state.selectedDate)}\nТема: ${topic}\nРубрика: ${rubric}\nПлейсмент: ${placement}\nФормат: ${format}\nРекомендований візуал: ${size}\nСвятковий контекст: ${holiday}\nКонтекст із нарад: ${meetingsContext || 'немає'}\n\nГачок: ${topic} — тема, яка має зачепити аудиторію саме в ${placement}.\n\nОсновна думка: У рубриці “${rubric}” важливо подати сенс через формат “${format}”, враховуючи контекст бізнесу й останні наради.\n\nСтруктура:\n1. Хук\n2. Основна користь\n3. Приклад / кейс / пояснення\n4. CTA\n\nCTA: Якщо хочеш, можу під цю тему зібрати серію контенту на кілька днів.`;
    const post = currentDraft(); post.text = document.getElementById('generatedText').value; post.status = 'gen'; state.posts[state.selectedDate]=[post]; saveState(); fillEditor(); drawCalendar();
  });
  document.getElementById('generateImage').addEventListener('click', ()=>{
    const topic = document.getElementById('customTopic').value || document.getElementById('topicPreset').value;
    document.getElementById('imageTitle').textContent = topic;
    document.getElementById('imageDesc').textContent = `Плейсмент: ${document.getElementById('placementSelect').value} • Формат: ${document.getElementById('formatSelect').value}`;
    const post = currentDraft(); post.text = document.getElementById('generatedText').value; post.status = 'gen'; state.posts[state.selectedDate]=[post]; saveState(); fillEditor(); drawCalendar();
  });
  document.getElementById('visualUpload').addEventListener('change', (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      const post = currentDraft();
      post.image = reader.result;
      post.status = 'draft';
      state.posts[state.selectedDate] = [post];
      saveState();
      fillEditor();
      drawCalendar();
    };
    reader.readAsDataURL(file);
  });
  enableEnterSubmit('postForm', ()=>savePost('draft'));
  document.getElementById('approvePost').addEventListener('click', ()=>savePost('done'));
  document.getElementById('goSettings').addEventListener('click', ()=>navigate('settings'));

  drawFilters();
  drawCalendar();
  fillEditor();
}

function renderSettingsPage(){
  renderSidebar('settings');
  renderHeader('Налаштування довідників', 'Aima • Rubrics / Placements / Formats');
  function syncAllCards(){
    const stats = document.getElementById('statsCards');
    stats.innerHTML = `
      <div class="stat-card"><strong>${state.rubrics.length}</strong><span>Рубрик</span></div>
      <div class="stat-card"><strong>${state.placements.length}</strong><span>Плейсментів</span></div>
      <div class="stat-card"><strong>${state.formats.length}</strong><span>Форматів</span></div>
      <div class="stat-card"><strong>${Object.keys(state.holidays).length}</strong><span>Святкових підказок</span></div>`;
  }
  syncAllCards();
  bindCollection('rubrics','rubricsList','rubricInput','addRubric',syncAllCards);
  bindCollection('placements','placementsList','placementInput','addPlacement',syncAllCards);
  bindCollection('formats','formatsList','formatInput','addFormat',syncAllCards);
  enableEnterSubmit('rubricForm', ()=>document.getElementById('addRubric').click());
  enableEnterSubmit('placementForm', ()=>document.getElementById('addPlacement').click());
  enableEnterSubmit('formatForm', ()=>document.getElementById('addFormat').click());
  bindNav();
}

function renderTopicsPage(){
  renderSidebar('topics');
  renderHeader('Теми', 'Aima • окрема вкладка керування темами');
  function sync(){
    const stats = document.getElementById('topicsStats');
    stats.innerHTML = `
      <div class="stat-card"><strong>${state.topics.length}</strong><span>Тем</span></div>
      <div class="stat-card"><strong>${state.meetings.length}</strong><span>Нарад у базі</span></div>
      <div class="stat-card"><strong>${state.topics.filter(t=>t.length>20).length}</strong><span>Розгорнутих тем</span></div>
      <div class="stat-card"><strong>${countAllPosts()}</strong><span>Постів у календарі</span></div>`;
    const preview = document.getElementById('generatedTopicsPreview');
    if(preview) preview.innerHTML = '';
  }
  sync();
  bindCollection('topics','topicsList','topicInput','addTopic',sync);
  enableEnterSubmit('topicForm', ()=>document.getElementById('addTopic').click());
  document.getElementById('generateTopicsFromMeetings').addEventListener('click', ()=>{
    const generated = generateTopicsFromMeetings();
    const preview = document.getElementById('generatedTopicsPreview');
    preview.innerHTML = generated.map((topic, idx)=>`<div class="generated-preview-item"><strong>${topic}</strong><div class="top-actions"><button class="btn btn-secondary" type="button" data-push-topic="${idx}">Додати в теми</button></div></div>`).join('');
    preview.querySelectorAll('[data-push-topic]').forEach(btn=>btn.addEventListener('click', ()=>{
      const topic = generated[Number(btn.dataset.pushTopic)];
      if(!state.topics.includes(topic)) state.topics.unshift(topic);
      saveState();
      renderTopicsPage();
    }));
  });
}

function renderMeetingsPage(){
  renderSidebar('meetings');
  renderHeader('Наради', 'Aima • джерело контексту для генерації тем');
  const stats = document.getElementById('meetingsStats');
  stats.innerHTML = `
    <div class="stat-card"><strong>${state.meetings.length}</strong><span>Нарад</span></div>
    <div class="stat-card"><strong>${state.topics.length}</strong><span>Поточних тем</span></div>
    <div class="stat-card"><strong>${generateTopicsFromMeetings().length}</strong><span>Можливих нових тем</span></div>
    <div class="stat-card"><strong>${countAllPosts()}</strong><span>Постів у календарі</span></div>`;

  function renderMeetings(){
    const list = document.getElementById('meetingsList');
    list.innerHTML = state.meetings.map((item, idx)=>`<div class="setting-row"><span><strong>${item.title}</strong><br><small>${item.date} — ${item.notes}</small></span><div class="row-actions"><button class="mini-btn danger" data-remove-meeting="${idx}">Видалити</button></div></div>`).join('');
    list.querySelectorAll('[data-remove-meeting]').forEach(btn=>btn.addEventListener('click', ()=>{ state.meetings.splice(Number(btn.dataset.removeMeeting),1); saveState(); renderMeetingsPage(); }));
  }
  renderMeetings();

  enableEnterSubmit('meetingForm', ()=>{
    const title = document.getElementById('meetingTitle').value.trim();
    const date = document.getElementById('meetingDate').value || new Date().toISOString().slice(0,10);
    const notes = document.getElementById('meetingNotes').value.trim();
    if(!title || !notes) return;
    state.meetings.unshift({ title, date, notes });
    saveState();
    document.getElementById('meetingTitle').value='';
    document.getElementById('meetingDate').value='';
    document.getElementById('meetingNotes').value='';
    renderMeetingsPage();
  });
}

window.addEventListener('DOMContentLoaded', ()=>{
  loadState();
  const page = document.body.dataset.page;
  if(page==='calendar') renderCalendarPage();
  if(page==='settings') renderSettingsPage();
  if(page==='topics') renderTopicsPage();
  if(page==='meetings') renderMeetingsPage();
});