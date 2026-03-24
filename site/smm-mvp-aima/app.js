const state = {
  currentDate: new Date(2026, 2, 24),
  selectedDate: '2026-03-24',
  activeFilter: 'all',
  currentView: 'calendar',
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

function pad(n){ return String(n).padStart(2,'0'); }
function dateKey(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function humanDate(str){ const d=new Date(str); return `${d.getDate()} ${monthNamesGen[d.getMonth()]} ${d.getFullYear()}`; }
function statusLabel(status){ return status==='done' ? 'Затверджено' : status==='gen' ? 'Згенеровано' : 'Чернетка'; }

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
}

function bindNav(){
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.nav));
  });
}

function renderSidebar(active){
  const menu = document.getElementById('sidebarMenu');
  if(!menu) return;
  const items = [
    ['calendar','Контент-календар'],
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

function renderCalendarPage(){
  renderSidebar('calendar');
  renderHeader('Контент-календар', 'Aima • SMM Planner MVP');

  const currentMonthEl = document.getElementById('currentMonth');
  const weekdays = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];
  document.getElementById('weekdays').innerHTML = weekdays.map(d=>`<div class="weekday">${d}</div>`).join('');

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
      grid.innerHTML += `
        <div class="day ${selected}" data-date="${key}">
          <div class="day-head"><span class="day-num">${day}</span><button class="icon-btn add-post" data-date="${key}">+</button></div>
          <div class="day-posts">
            ${filtered.slice(0,3).map(post=>`<div class="post-pill ${post.status||'draft'}"><strong>${post.topic}</strong><span>${post.placement}</span></div>`).join('')}
          </div>
        </div>`;
    }
    grid.querySelectorAll('.day[data-date]').forEach(el=>el.addEventListener('click', (e)=>{
      if(e.target.classList.contains('add-post')) return;
      state.selectedDate = el.dataset.date; saveState(); drawCalendar(); fillEditor();
    }));
    grid.querySelectorAll('.add-post').forEach(btn=>btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      state.selectedDate = btn.dataset.date; saveState(); fillEditor(); drawCalendar();
      document.getElementById('customTopic').focus();
    }));
  }

  function fillSelect(id, items){
    const el = document.getElementById(id);
    el.innerHTML = items.map(item=>`<option value="${item}">${item}</option>`).join('');
  }

  function fillEditor(){
    const post = (state.posts[state.selectedDate]||[])[0] || { topic:'', placement: state.placements[0], rubric: state.rubrics[0], format: state.formats[0], status:'draft' };
    document.getElementById('selectedDate').textContent = humanDate(state.selectedDate);
    document.getElementById('postDate').value = state.selectedDate;
    document.getElementById('topicPreset').innerHTML = state.topics.map(t=>`<option value="${t}">${t}</option>`).join('');
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
  }

  function currentDraft(){
    return {
      topic: document.getElementById('customTopic').value || document.getElementById('topicPreset').value,
      rubric: document.getElementById('rubricSelect').value,
      placement: document.getElementById('placementSelect').value,
      format: document.getElementById('formatSelect').value,
      text: document.getElementById('generatedText').value,
      status: 'draft'
    };
  }

  function savePost(status='draft'){
    const draft = currentDraft();
    draft.status = status;
    state.posts[state.selectedDate] = [draft];
    saveState();
    fillEditor();
    drawCalendar();
  }

  document.getElementById('prevMonth').addEventListener('click', ()=>{ state.currentDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth()-1, 1); saveState(); drawCalendar(); });
  document.getElementById('nextMonth').addEventListener('click', ()=>{ state.currentDate = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth()+1, 1); saveState(); drawCalendar(); });
  document.getElementById('usePreset').addEventListener('click', ()=>{ document.getElementById('customTopic').value = document.getElementById('topicPreset').value; });
  document.getElementById('generateText').addEventListener('click', ()=>{
    const topic = document.getElementById('customTopic').value || document.getElementById('topicPreset').value;
    const rubric = document.getElementById('rubricSelect').value;
    const placement = document.getElementById('placementSelect').value;
    const format = document.getElementById('formatSelect').value;
    document.getElementById('generatedText').value = `Тема: ${topic}\n\nГачок: Чому більшість контенту для ${placement} не дає результату?\n\nСуть: У рубриці “${rubric}” важливо не просто постити, а будувати думку під формат “${format}”.\n\nСтруктура:\n1. Хук\n2. Основна цінність\n3. Приклад або кейс\n4. CTA\n\nCTA: Хочеш, щоб я зібрав під це контент-план?`;
    const post = currentDraft(); post.text = document.getElementById('generatedText').value; post.status = 'gen'; state.posts[state.selectedDate]=[post]; saveState(); fillEditor(); drawCalendar();
  });
  document.getElementById('generateImage').addEventListener('click', ()=>{
    const topic = document.getElementById('customTopic').value || document.getElementById('topicPreset').value;
    document.getElementById('imageTitle').textContent = topic;
    document.getElementById('imageDesc').textContent = `Плейсмент: ${document.getElementById('placementSelect').value} • Формат: ${document.getElementById('formatSelect').value}`;
    const post = currentDraft(); post.text = document.getElementById('generatedText').value; post.status = 'gen'; state.posts[state.selectedDate]=[post]; saveState(); fillEditor(); drawCalendar();
  });
  document.getElementById('saveDraft').addEventListener('click', ()=>savePost('draft'));
  document.getElementById('approvePost').addEventListener('click', ()=>savePost('done'));
  document.getElementById('goSettings').addEventListener('click', ()=>navigate('settings'));

  drawFilters();
  drawCalendar();
  fillEditor();
}

function renderSettingsPage(){
  renderSidebar('settings');
  renderHeader('Налаштування довідників', 'Aima • Rubrics / Placements / Formats');

  function bindCollection(key, listId, inputId, addId){
    const render = ()=>{
      const list = document.getElementById(listId);
      list.innerHTML = state[key].map((item, idx) => `
        <div class="setting-row">
          <span>${item}</span>
          <div class="row-actions">
            <button class="mini-btn" data-edit="${idx}">Редагувати</button>
            <button class="mini-btn danger" data-remove="${idx}">Видалити</button>
          </div>
        </div>`).join('');
      list.querySelectorAll('[data-remove]').forEach(btn=>btn.addEventListener('click', ()=>{ state[key].splice(Number(btn.dataset.remove),1); saveState(); render(); if(key==='placements'||key==='rubrics'||key==='formats'||key==='topics') syncAllCards(); }));
      list.querySelectorAll('[data-edit]').forEach(btn=>btn.addEventListener('click', ()=>{
        const idx = Number(btn.dataset.edit); const next = prompt('Нове значення', state[key][idx]);
        if(next){ state[key][idx]=next; saveState(); render(); syncAllCards(); }
      }));
    };
    document.getElementById(addId).addEventListener('click', ()=>{
      const input = document.getElementById(inputId);
      const value = input.value.trim();
      if(!value) return;
      state[key].push(value); input.value=''; saveState(); render(); syncAllCards();
    });
    render();
  }

  function syncAllCards(){
    const stats = document.getElementById('statsCards');
    stats.innerHTML = `
      <div class="stat-card"><strong>${state.rubrics.length}</strong><span>Рубрик</span></div>
      <div class="stat-card"><strong>${state.placements.length}</strong><span>Плейсментів</span></div>
      <div class="stat-card"><strong>${state.formats.length}</strong><span>Форматів</span></div>
      <div class="stat-card"><strong>${state.topics.length}</strong><span>Готових тем</span></div>`;
  }

  syncAllCards();
  bindCollection('rubrics','rubricsList','rubricInput','addRubric');
  bindCollection('placements','placementsList','placementInput','addPlacement');
  bindCollection('formats','formatsList','formatInput','addFormat');
  bindCollection('topics','topicsList','topicInput','addTopic');
}

window.addEventListener('DOMContentLoaded', ()=>{
  loadState();
  const page = document.body.dataset.page;
  if(page==='calendar') renderCalendarPage();
  if(page==='settings') renderSettingsPage();
});