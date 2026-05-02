// ——— DATA ———
  let entries = JSON.parse(localStorage.getItem('notesDeFrais') || '[]');
  let editingId = null;
  let sortField = 'date';
  let sortAsc = false;

  const CATEGORIES = {
    transport: 'Transport',
    repas: 'Repas',
    hebergement: 'Hébergement',
    materiel: 'Matériel',
    autre: 'Autre'
  };

  const STATUTS = {
    pending: 'En attente',
    validated: 'Validé',
    rejected: 'Refusé'
  };

  function save() {
    localStorage.setItem('notesDeFrais', JSON.stringify(entries));
  }

  function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  // ——— RENDER ———
  function renderTable() {
    const cat = document.getElementById('filterCategorie').value;
    const statut = document.getElementById('filterStatut').value;
    const search = document.getElementById('searchInput').value.toLowerCase();

    let filtered = entries.filter(e => {
      if (cat && e.categorie !== cat) return false;
      if (statut && e.statut !== statut) return false;
      if (search && !e.description.toLowerCase().includes(search) && !e.justificatif.toLowerCase().includes(search)) return false;
      return true;
    });

    filtered.sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === 'montant') { va = parseFloat(va); vb = parseFloat(vb); }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });

    const tbody = document.getElementById('tableBody');
    const empty = document.getElementById('emptyState');

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      empty.style.display = '';
    } else {
      empty.style.display = 'none';
      tbody.innerHTML = filtered.map(e => `
        <tr>
          <td>${formatDate(e.date)}</td>
          <td>
            <div style="font-weight:500">${escHtml(e.description)}</div>
            ${e.notes ? `<div style="font-size:12px;color:var(--text-muted)">${escHtml(e.notes.substring(0,60))}${e.notes.length>60?'…':''}</div>` : ''}
          </td>
          <td><span class="badge badge-${e.categorie}">${CATEGORIES[e.categorie]}</span></td>
          <td style="font-size:13px;color:var(--text-muted)">${escHtml(e.justificatif) || '—'}</td>
          <td class="amount amount-positive">${formatAmount(e.montant)}</td>
          <td>
            <span class="badge badge-${e.statut}">${STATUTS[e.statut]}</span>
          </td>
          <td style="text-align:right">
            <div style="display:flex;gap:6px;justify-content:flex-end">
              <button class="btn btn-sm btn-outline" onclick="openDetail('${e.id}')" title="Détail">👁</button>
              <button class="btn btn-sm btn-outline" onclick="openEdit('${e.id}')" title="Modifier">✏️</button>
              <button class="btn btn-sm btn-danger" onclick="deleteEntry('${e.id}')" title="Supprimer">🗑</button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    updateStats();
    renderRecap();
  }

  function updateStats() {
    const total = entries.reduce((s, e) => s + parseFloat(e.montant), 0);
    const validated = entries.filter(e => e.statut === 'validated').reduce((s, e) => s + parseFloat(e.montant), 0);
    const pending = entries.filter(e => e.statut === 'pending').reduce((s, e) => s + parseFloat(e.montant), 0);

    document.getElementById('statTotal').textContent = formatAmount(total);
    document.getElementById('statValidated').textContent = formatAmount(validated);
    document.getElementById('statPending').textContent = formatAmount(pending);
    document.getElementById('statCount').textContent = entries.length;
  }

  function renderRecap() {
    const el = document.getElementById('recapContent');
    if (entries.length === 0) {
      el.innerHTML = '<div class="empty-state"><div class="icon">📊</div><p>Aucune donnée à afficher.</p></div>';
      return;
    }

    const byCategory = {};
    entries.forEach(e => {
      if (!byCategory[e.categorie]) byCategory[e.categorie] = { count: 0, total: 0 };
      byCategory[e.categorie].count++;
      byCategory[e.categorie].total += parseFloat(e.montant);
    });

    const totalGlobal = entries.reduce((s, e) => s + parseFloat(e.montant), 0);

    el.innerHTML = `
      <h3 style="font-family:'Syne',sans-serif;margin-bottom:1rem;font-size:0.95rem">Répartition par catégorie</h3>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:2rem">
        ${Object.entries(byCategory).map(([cat, data]) => {
          const pct = totalGlobal > 0 ? (data.total / totalGlobal * 100).toFixed(1) : 0;
          return `
            <div>
              <div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:13px">
                <span><span class="badge badge-${cat}">${CATEGORIES[cat]}</span> <span style="color:var(--text-muted)">${data.count} dépense(s)</span></span>
                <strong>${formatAmount(data.total)} <span style="color:var(--text-muted);font-weight:400">(${pct}%)</span></strong>
              </div>
              <div style="background:var(--surface2);border-radius:4px;height:8px;overflow:hidden">
                <div style="background:var(--accent);width:${pct}%;height:100%;border-radius:4px;transition:width 0.5s"></div>
              </div>
            </div>`;
        }).join('')}
      </div>

      <h3 style="font-family:'Syne',sans-serif;margin-bottom:1rem;font-size:0.95rem">Répartition par statut</h3>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:2rem">
        ${['pending','validated','rejected'].map(s => {
          const total = entries.filter(e=>e.statut===s).reduce((sum,e)=>sum+parseFloat(e.montant),0);
          const count = entries.filter(e=>e.statut===s).length;
          return `
            <div class="stat-card" style="padding:1rem">
              <span class="badge badge-${s}" style="margin-bottom:6px">${STATUTS[s]}</span>
              <div style="font-weight:700;font-size:1.1rem">${formatAmount(total)}</div>
              <div style="font-size:12px;color:var(--text-muted)">${count} entrée(s)</div>
            </div>`;
        }).join('')}
      </div>

      <div style="background:var(--surface2);border-radius:var(--radius);padding:1.25rem;display:flex;justify-content:space-between;align-items:center">
        <span style="font-weight:600">TOTAL GÉNÉRAL</span>
        <span style="font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:700;color:var(--accent)">${formatAmount(totalGlobal)}</span>
      </div>
    `;
  }

  // ——— MODAL ADD/EDIT ———
  function openAddModal() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Ajouter une dépense';
    document.getElementById('inputDate').value = new Date().toISOString().slice(0,10);
    document.getElementById('inputCategorie').value = '';
    document.getElementById('inputDescription').value = '';
    document.getElementById('inputMontant').value = '';
    document.getElementById('inputJustificatif').value = '';
    document.getElementById('inputNotes').value = '';
    openModal('addModal');
  }

  function openEdit(id) {
    const e = entries.find(x => x.id === id);
    if (!e) return;
    editingId = id;
    document.getElementById('modalTitle').textContent = 'Modifier la dépense';
    document.getElementById('inputDate').value = e.date;
    document.getElementById('inputCategorie').value = e.categorie;
    document.getElementById('inputDescription').value = e.description;
    document.getElementById('inputMontant').value = e.montant;
    document.getElementById('inputJustificatif').value = e.justificatif;
    document.getElementById('inputNotes').value = e.notes;
    openModal('addModal');
  }

  function saveEntry() {
    const date = document.getElementById('inputDate').value;
    const categorie = document.getElementById('inputCategorie').value;
    const description = document.getElementById('inputDescription').value.trim();
    const montant = parseFloat(document.getElementById('inputMontant').value);
    const justificatif = document.getElementById('inputJustificatif').value.trim();
    const notes = document.getElementById('inputNotes').value.trim();

    if (!date || !categorie || !description || isNaN(montant) || montant < 0) {
      showToast('⚠️ Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (editingId) {
      const idx = entries.findIndex(e => e.id === editingId);
      entries[idx] = { ...entries[idx], date, categorie, description, montant, justificatif, notes };
      showToast('✅ Dépense modifiée !');
    } else {
      entries.unshift({ id: genId(), date, categorie, description, montant, justificatif, notes, statut: 'pending' });
      showToast('✅ Dépense ajoutée !');
    }

    save();
    closeModal('addModal');
    renderTable();
  }

  // ——— MODAL DETAIL ———
  function openDetail(id) {
    const e = entries.find(x => x.id === id);
    if (!e) return;
    document.getElementById('detailBody').innerHTML = `
      <table style="width:100%;border-collapse:collapse">
        ${[
          ['Date', formatDate(e.date)],
          ['Catégorie', `<span class="badge badge-${e.categorie}">${CATEGORIES[e.categorie]}</span>`],
          ['Description', escHtml(e.description)],
          ['Montant', `<strong class="amount">${formatAmount(e.montant)}</strong>`],
          ['Justificatif', escHtml(e.justificatif) || '—'],
          ['Statut', `<span class="badge badge-${e.statut}">${STATUTS[e.statut]}</span>`],
          ['Notes', escHtml(e.notes) || '—'],
        ].map(([k,v]) => `
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:10px 0;color:var(--text-muted);font-size:13px;width:120px">${k}</td>
            <td style="padding:10px 0;font-size:14px">${v}</td>
          </tr>
        `).join('')}
      </table>
    `;
    document.getElementById('detailFooter').innerHTML = `
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${e.statut !== 'validated' ? `<button class="btn btn-success btn-sm" onclick="changeStatut('${e.id}','validated');closeModal('detailModal')">✅ Valider</button>` : ''}
        ${e.statut !== 'rejected' ? `<button class="btn btn-danger btn-sm" onclick="changeStatut('${e.id}','rejected');closeModal('detailModal')">❌ Refuser</button>` : ''}
        ${e.statut !== 'pending' ? `<button class="btn btn-outline btn-sm" onclick="changeStatut('${e.id}','pending');closeModal('detailModal')">🔄 En attente</button>` : ''}
        <button class="btn btn-outline btn-sm" onclick="closeModal('detailModal')">Fermer</button>
      </div>
    `;
    openModal('detailModal');
  }

  function changeStatut(id, statut) {
    const idx = entries.findIndex(e => e.id === id);
    if (idx === -1) return;
    entries[idx].statut = statut;
    save();
    renderTable();
    showToast(`Statut mis à jour : ${STATUTS[statut]}`);
  }

  // ——— DELETE ———
  function deleteEntry(id) {
    if (!confirm('Supprimer cette dépense ?')) return;
    entries = entries.filter(e => e.id !== id);
    save();
    renderTable();
    showToast('🗑️ Dépense supprimée.');
  }

  // ——— SORT ———
  function sortBy(field) {
    if (sortField === field) sortAsc = !sortAsc;
    else { sortField = field; sortAsc = true; }
    renderTable();
  }

  // ——— FILTERS ———
  function clearFilters() {
    document.getElementById('filterCategorie').value = '';
    document.getElementById('filterStatut').value = '';
    document.getElementById('searchInput').value = '';
    renderTable();
  }

  // ——— TABS ———
  function switchTab(tab, btn) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    btn.classList.add('active');
    if (tab === 'recap') renderRecap();
  }

  // ——— EXPORT ———
  function openExportModal() { openModal('exportModal'); }

  function exportCSV() {
    const headers = ['Date', 'Catégorie', 'Description', 'Montant', 'Justificatif', 'Statut', 'Notes'];
    const rows = entries.map(e => [
      e.date, CATEGORIES[e.categorie], `"${e.description.replace(/"/g,'""')}"`,
      e.montant, e.justificatif, STATUTS[e.statut], `"${(e.notes||'').replace(/"/g,'""')}"`
    ]);
    const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    download('notes-de-frais.csv', csv, 'text/csv;charset=utf-8;');
    closeModal('exportModal');
    showToast('📊 Export CSV téléchargé !');
  }

  function exportJSON() {
    download('notes-de-frais.json', JSON.stringify(entries, null, 2), 'application/json');
    closeModal('exportModal');
    showToast('📄 Export JSON téléchargé !');
  }

  function printPage() {
    closeModal('exportModal');
    window.print();
  }

  function download(filename, content, type) {
    const blob = new Blob(['\uFEFF' + content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  // ——— MODAL HELPERS ———
  function openModal(id) { document.getElementById(id).classList.add('open'); }
  function closeModal(id) { document.getElementById(id).classList.remove('open'); }

  document.querySelectorAll('.modal-overlay').forEach(el => {
    el.addEventListener('click', function(e) {
      if (e.target === this) this.classList.remove('open');
    });
  });

  // ——— TOAST ———
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
  }

  // ——— HELPERS ———
  function formatDate(d) {
    if (!d) return '—';
    const [y, m, j] = d.split('-');
    return `${j}/${m}/${y}`;
  }

  function formatAmount(n) {
    return parseFloat(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }

  function escHtml(s) {
    if (!s) return '';
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ——— INIT ———
  renderTable();