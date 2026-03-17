// ─── State ───────────────────────────────────────────────────
let board = { cards: [] }
let selectedPriority = 'medium'
let selectedCategory = 'uncategorized'
let draggedId = null
let activeTab = 'board'
const colSort = { 'todo': null, 'in-progress': null, 'done': null }

const COLUMNS = ['todo', 'in-progress', 'done']

// ─── Init ─────────────────────────────────────────────────────
async function init() {
  board = await window.kanban.loadBoard()
  if (!board.cards) board.cards = []
  renderBoard()
  setupColumnDropZones()
  setupModalHandlers()
  setupKeyboard()
  setupTabs()
  setupLearnedSave()
  setupSortControls()
}

// ─── Render ───────────────────────────────────────────────────
function renderBoard() {
  let totalCards = 0

  COLUMNS.forEach(col => {
    const cards = getDisplayCards(col)
    totalCards += cards.length

    document.getElementById(`count-${col}`).textContent = cards.length
    document.getElementById(`cards-${col}`).innerHTML = cards.map(renderCard).join('')

    // Re-attach card drag listeners
    cards.forEach(card => {
      const el = document.getElementById(`card-${card.id}`)
      if (el) {
        el.addEventListener('dragstart', (e) => onDragStart(e, card.id))
        el.addEventListener('dragend',   onDragEnd)
        el.addEventListener('dragover',  onCardDragOver)
        el.addEventListener('dragleave', onCardDragLeave)
        el.addEventListener('drop',      (e) => onCardDrop(e, card.id, col))
      }
    })
  })

  document.getElementById('header-stats').textContent =
    `${totalCards} ${totalCards === 1 ? 'task' : 'tasks'}`
}

function getColCards(col) {
  return board.cards
    .filter(c => c.columnId === col)
    .sort((a, b) => a.order - b.order)
}

function getDisplayCards(col) {
  const cards  = getColCards(col)
  const sort   = colSort[col]
  if (!sort) return cards
  const sorted = [...cards]
  if (sort === 'priority') {
    const rank = { high: 0, medium: 1, low: 2 }
    sorted.sort((a, b) => rank[a.priority] - rank[b.priority])
  } else if (sort === 'created') {
    sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
  return sorted
}

function renderCard(card) {
  const cat = card.category || 'uncategorized'
  const desc = card.description
    ? `<div class="card-desc">${escHtml(card.description)}</div>`
    : ''
  const catLabel = cat === 'uncategorized' ? '' :
    `<span class="category-chip cat-${cat}">${cat}</span>`
  return `
    <div class="card priority-${card.priority} cat-border-${cat}"
         id="card-${card.id}"
         draggable="true"
         data-id="${card.id}">
      ${catLabel}
      <div class="card-title">${escHtml(card.title)}</div>
      ${desc}
      <div class="card-footer">
        <span class="priority-badge priority-badge-${card.priority}">${card.priority}</span>
        <div class="card-actions">
          <button class="icon-btn" data-action="edit" data-id="${card.id}" title="Edit">✏</button>
          <button class="icon-btn delete" data-action="delete" data-id="${card.id}" title="Delete">✕</button>
        </div>
      </div>
    </div>
  `
}

// ─── Card Actions (event delegation) ─────────────────────────
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]')
  if (!btn) return
  const id = btn.dataset.id
  if (btn.dataset.action === 'edit')   openEditModal(id)
  if (btn.dataset.action === 'delete') deleteCard(id)
})

// ─── Modal ────────────────────────────────────────────────────
function setupModalHandlers() {
  document.getElementById('modal-close-btn').addEventListener('click',  closeModal)
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal)
  document.getElementById('modal-save-btn').addEventListener('click',   saveCard)
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal()
  })
  document.getElementById('priority-selector').addEventListener('click', (e) => {
    const btn = e.target.closest('.priority-btn')
    if (btn) selectPriority(btn.dataset.p)
  })
  document.getElementById('category-selector').addEventListener('click', (e) => {
    const btn = e.target.closest('.category-btn')
    if (btn) selectCategory(btn.dataset.cat)
  })
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => openAddModal(btn.dataset.col))
  })
}

function openAddModal(col) {
  document.getElementById('modal-title').textContent = 'Add Card'
  document.getElementById('card-title').value = ''
  document.getElementById('card-desc').value = ''
  document.getElementById('edit-id').value = ''
  document.getElementById('edit-column').value = col
  selectPriority('medium')
  selectCategory('uncategorized')
  showModal()
}

function openEditModal(id) {
  const card = board.cards.find(c => c.id === id)
  if (!card) return
  document.getElementById('modal-title').textContent = 'Edit Card'
  document.getElementById('card-title').value = card.title
  document.getElementById('card-desc').value = card.description || ''
  document.getElementById('edit-id').value = card.id
  document.getElementById('edit-column').value = card.columnId
  selectPriority(card.priority || 'medium')
  selectCategory(card.category || 'uncategorized')
  showModal()
}

function showModal() {
  document.getElementById('modal-overlay').classList.add('visible')
  setTimeout(() => document.getElementById('card-title').focus(), 50)
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('visible')
  document.getElementById('card-title').classList.remove('error')
}

function selectPriority(p) {
  selectedPriority = p
  document.querySelectorAll('.priority-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.p === p)
  })
}

function selectCategory(cat) {
  selectedCategory = cat
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === cat)
  })
}

function saveCard() {
  const title = document.getElementById('card-title').value.trim()
  if (!title) {
    document.getElementById('card-title').classList.add('error')
    document.getElementById('card-title').focus()
    return
  }

  const id  = document.getElementById('edit-id').value
  const col = document.getElementById('edit-column').value
  const desc = document.getElementById('card-desc').value.trim()
  const now = new Date().toISOString()

  if (id) {
    const card = board.cards.find(c => c.id === id)
    if (card) {
      card.title       = title
      card.description = desc
      card.priority    = selectedPriority
      card.category    = selectedCategory
      card.updatedAt   = now
    }
  } else {
    getColCards(col).forEach(c => { c.order += 1 })
    board.cards.push({
      id:          genId(),
      title,
      description: desc,
      priority:    selectedPriority,
      category:    selectedCategory,
      columnId:    col,
      order:       0,
      createdAt:   now,
      updatedAt:   now
    })
  }

  closeModal()
  persistAndRender()
}

function deleteCard(id) {
  board.cards = board.cards.filter(c => c.id !== id)
  persistAndRender()
}

// ─── Drag & Drop ──────────────────────────────────────────────
function setupColumnDropZones() {
  COLUMNS.forEach(col => {
    const container = document.getElementById(`cards-${col}`)
    container.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      container.classList.add('drag-over')
    })
    container.addEventListener('dragleave', (e) => {
      if (!container.contains(e.relatedTarget)) {
        container.classList.remove('drag-over')
      }
    })
    container.addEventListener('drop', (e) => {
      e.preventDefault()
      container.classList.remove('drag-over')
      if (!draggedId) return

      const card = board.cards.find(c => c.id === draggedId)
      if (!card) return

      if (colSort[col]) {
        bakeSort(col)
        colSort[col] = null
        updateSortDropdown(col)
      }

      // Dropped on empty space → append to end
      const now = new Date().toISOString()
      if (col === 'done' && !card.completedAt) card.completedAt = now
      else if (col !== 'done') delete card.completedAt
      card.columnId  = col
      card.updatedAt = now
      card.order     = getColCards(col).filter(c => c.id !== draggedId).length
      reorderCol(col)
      draggedId = null
      persistAndRender()
    })
  })
}

function onDragStart(e, id) {
  draggedId = id
  e.dataTransfer.effectAllowed = 'move'
  e.currentTarget.classList.add('dragging')
}

function onDragEnd(e) {
  e.currentTarget.classList.remove('dragging')
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))
}

function onCardDragOver(e) {
  e.preventDefault()
  e.stopPropagation()
}

function onCardDragLeave(e) {
  e.currentTarget.classList.remove('drag-target-above')
}

function onCardDrop(e, targetId, col) {
  e.preventDefault()
  e.stopPropagation()
  if (!draggedId || draggedId === targetId) return

  const dragged = board.cards.find(c => c.id === draggedId)
  const target  = board.cards.find(c => c.id === targetId)
  if (!dragged || !target) return

  if (colSort[col]) {
    bakeSort(col)
    colSort[col] = null
    updateSortDropdown(col)
  }

  const dropNow = new Date().toISOString()
  if (col === 'done' && !dragged.completedAt) dragged.completedAt = dropNow
  else if (col !== 'done') delete dragged.completedAt
  dragged.columnId  = col
  dragged.updatedAt = dropNow

  // Insert before or after target based on cursor Y
  const rect    = e.currentTarget.getBoundingClientRect()
  const midY    = rect.top + rect.height / 2
  const insertBefore = e.clientY < midY

  const colCards = getColCards(col).filter(c => c.id !== draggedId)
  const targetIdx = colCards.findIndex(c => c.id === targetId)

  colCards.splice(insertBefore ? targetIdx : targetIdx + 1, 0, dragged)
  colCards.forEach((c, i) => { c.order = i })

  draggedId = null
  persistAndRender()
}

function reorderCol(col) {
  getColCards(col).forEach((c, i) => { c.order = i })
}

// ─── Keyboard ─────────────────────────────────────────────────
function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal()
    if (e.key === 'Enter' && isModalOpen()) {
      if (document.activeElement.tagName !== 'TEXTAREA') saveCard()
    }
  })
}

function isModalOpen() {
  return document.getElementById('modal-overlay').classList.contains('visible')
}

// ─── Persistence ──────────────────────────────────────────────
function persistAndRender() {
  window.kanban.saveBoard(board)
  renderBoard()
  if (activeTab === 'progress') renderProgress()
}

// ─── Utilities ────────────────────────────────────────────────
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function escHtml(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  return String(str).replace(/[&<>"']/g, c => map[c])
}

// ─── Tabs ─────────────────────────────────────────────────────
function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn))
      document.getElementById('board-panel').style.display   = activeTab === 'board'    ? '' : 'none'
      document.getElementById('progress-panel').style.display = activeTab === 'progress' ? '' : 'none'
      if (activeTab === 'progress') renderProgress()
    })
  })
}

// ─── Progress Tab ──────────────────────────────────────────────
function setupLearnedSave() {
  document.getElementById('progress-panel').addEventListener('focusout', (e) => {
    if (!e.target.classList.contains('learned-input')) return
    const card = board.cards.find(c => c.id === e.target.dataset.id)
    if (!card) return
    card.learned   = e.target.value
    card.updatedAt = new Date().toISOString()
    window.kanban.saveBoard(board)
  })
}

function renderProgress() {
  const stats = computeStats()
  document.getElementById('stat-week-done').textContent     = stats.weekDone
  document.getElementById('stat-week-progress').textContent = stats.weekInProgress
  document.getElementById('stat-month-done').textContent    = stats.monthDone
  document.getElementById('stat-month-progress').textContent = stats.monthInProgress

  const cards = board.cards
    .filter(c => c.columnId === 'done' || c.columnId === 'in-progress')
    .map(c => ({ ...c, _sortDate: new Date(c.completedAt || c.updatedAt) }))
    .sort((a, b) => b._sortDate - a._sortDate)

  const timeline = document.getElementById('progress-timeline')
  if (cards.length === 0) {
    timeline.innerHTML = '<div class="timeline-empty">No cards in progress or done yet.</div>'
    return
  }

  const groups = new Map()
  cards.forEach(card => {
    const key = getWeekStart(card._sortDate).toISOString().slice(0, 10)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(card)
  })

  let html = ''
  groups.forEach((groupCards, weekKey) => {
    const start = new Date(weekKey + 'T12:00:00')
    const end   = new Date(start)
    end.setDate(end.getDate() + 6)
    html += `<div class="week-group">
      <div class="week-label">${formatDateRange(start, end)}</div>
      ${groupCards.map(renderProgressRow).join('')}
    </div>`
  })
  timeline.innerHTML = html
}

function computeStats() {
  const now        = new Date()
  const weekStart  = getWeekStart(now)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const done       = board.cards.filter(c => c.columnId === 'done')
  const inProgress = board.cards.filter(c => c.columnId === 'in-progress')

  return {
    weekDone:        done.filter(c => new Date(c.completedAt || c.updatedAt) >= weekStart).length,
    weekInProgress:  inProgress.filter(c => new Date(c.updatedAt) >= weekStart).length,
    monthDone:       done.filter(c => new Date(c.completedAt || c.updatedAt) >= monthStart).length,
    monthInProgress: inProgress.filter(c => new Date(c.updatedAt) >= monthStart).length,
  }
}

function getWeekStart(date) {
  const d   = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDateRange(start, end) {
  const opts = { month: 'short', day: 'numeric' }
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`
}

function renderProgressRow(card) {
  const cat     = card.category || 'uncategorized'
  const catChip = cat === 'uncategorized' ? '' :
    `<span class="category-chip cat-${cat}">${cat}</span>`
  const dotClass = card.columnId === 'done' ? 'dot-done' : 'dot-progress'
  const learned  = escHtml(card.learned || '')
  return `
    <div class="progress-row">
      <span class="status-dot ${dotClass}"></span>
      <div class="progress-row-main">
        <div class="progress-row-title">${escHtml(card.title)}${catChip ? ' ' + catChip : ''}</div>
        <textarea class="learned-input" data-id="${card.id}" placeholder="What did you learn?" rows="1">${learned}</textarea>
      </div>
    </div>
  `
}

// ─── Sort Controls ────────────────────────────────────────────
function setupSortControls() {
  COLUMNS.forEach(col => {
    const header = document.querySelector(`.column[data-col="${col}"] .column-header`)
    const bar = document.createElement('div')
    bar.className = 'sort-bar'
    bar.innerHTML = `
      <select class="sort-select" data-col="${col}">
        <option value="">Default order</option>
        <option value="priority">Priority</option>
        <option value="created">Created</option>
      </select>
    `
    header.appendChild(bar)
    bar.querySelector('.sort-select').addEventListener('change', (e) => {
      colSort[col] = e.target.value || null
      renderBoard()
    })
  })
}

function bakeSort(col) {
  getDisplayCards(col).forEach((c, i) => { c.order = i })
}

function updateSortDropdown(col) {
  const sel = document.querySelector(`.sort-select[data-col="${col}"]`)
  if (sel) sel.value = ''
}

// ─── Start ────────────────────────────────────────────────────
init()
