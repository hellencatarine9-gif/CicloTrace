// =========================================================================
// ESTADO INICIAL DA SESSÃO (Sincronizado com o Dashboard Power BI: 3.000 kg)
// =========================================================================
const INITIAL_BATCHES = [
  {
    codigo: 'NORTE-DIU-001',
    material: 'Plástico PET e Papelão',
    peso: 1400,
    rota: 'Rota Norte',
    origem: 'EMLURB - Rota Norte (Av. Norte / Casa Amarela, Recife)',
    destino: 'Cooperativa Recicla Recife',
    classificacao: 'Aproveitável',
    valorKg: 1.45,
    timestamp: 'Hoje, 08:15',
    hash: '0x8F4C...91A2'
  },
  {
    codigo: 'SUL-NOT-001',
    material: 'Ferro e Sucata Metálica',
    peso: 950,
    rota: 'Rota Sul',
    origem: 'EMLURB - Rota Sul (Av. Boa Viagem / Pina, Recife)',
    destino: 'Cooperativa Recicla Recife',
    classificacao: 'Aproveitável',
    valorKg: 1.10,
    timestamp: 'Hoje, 09:02',
    hash: '0x3E7B...44D9'
  },
  {
    codigo: 'SUL-NOT-002-CONTAMINADO',
    material: 'Rejeito Lixo Comum e Hospitalar',
    peso: 450,
    rota: 'Rota Sul',
    origem: 'EMLURB - Rota Sul (Av. Boa Viagem / Pina, Recife)',
    destino: 'Aterro Controlado (Bloqueado p/ Cooperativa)',
    classificacao: 'Perda / Contaminado',
    valorKg: 0,
    timestamp: 'Hoje, 09:28',
    hash: '0x9A1D...77C0'
  },
  {
    codigo: 'NORTE-DIU-002-QUEBRA',
    material: 'Desvio Catadores Anônimos',
    peso: 200,
    rota: 'Rota Norte',
    origem: 'EMLURB - Rota Norte (Av. Norte / Casa Amarela, Recife)',
    destino: 'Alerta de Desvio / Quebra de Pesagem',
    classificacao: 'Perda / Contaminado',
    valorKg: 0,
    timestamp: 'Hoje, 10:05',
    hash: '0x5C2F...18E4'
  }
];

let state = {
  currentScreen: 'acesso',
  selectedUnit: 'EMLURB - Rota Norte (Av. Norte / Casa Amarela, Recife)',
  selectedRole: 'Operador de Coleta',
  formRota: 'Rota Norte',
  formClassificacao: 'Aproveitável',
  batches: JSON.parse(JSON.stringify(INITIAL_BATCHES)),
  selectedAuditCodigo: 'NORTE-DIU-001',
  selectedGraphNode: 'origem'
};

// =========================================================================
// UTILITÁRIOS DE FORMATAÇÃO E NOTIFICAÇÃO
// =========================================================================
function formatNumberBR(num) {
  return Number(num).toLocaleString('pt-BR');
}

function formatCurrencyBR(num) {
  return Number(num).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

let toastTimeout = null;
function showToast(message, type = 'blue') {
  const banner = document.getElementById('toastBanner');
  const msgEl = document.getElementById('toastMessage');
  msgEl.textContent = message;

  banner.classList.remove('hidden', 'bg-[#0284C7]', 'bg-[#16A34A]', 'bg-[#EA580C]');
  if (type === 'green') banner.classList.add('bg-[#16A34A]');
  else if (type === 'orange') banner.classList.add('bg-[#EA580C]');
  else banner.classList.add('bg-[#0284C7]');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    hideToast();
  }, 3400);
}

function hideToast() {
  document.getElementById('toastBanner').classList.add('hidden');
}

// =========================================================================
// NAVEGAÇÃO ENTRE AS 4 TELAS
// =========================================================================
function navigateTo(screenId) {
  state.currentScreen = screenId;

  // Alterna visibilidade das seções
  ['acesso', 'registrar', 'rastreio', 'indicadores'].forEach(id => {
    const el = document.getElementById(`screen-${id}`);
    if (id === screenId) {
      el.classList.remove('hidden');
      // Reinicia animação
      el.classList.remove('screen-animate');
      void el.offsetWidth;
      el.classList.add('screen-animate');
    } else {
      el.classList.add('hidden');
    }
  });

  // Barra superior contextual oculta na Tela 1 (Acesso) e visível nas demais
  const topBar = document.getElementById('appTopBar');
  if (screenId === 'acesso') {
    topBar.classList.add('hidden');
  } else {
    topBar.classList.remove('hidden');
    updateHeaderContext();
  }

  // Atualiza estado ativo da navegação inferior
  document.querySelectorAll('.nav-tab').forEach(tab => {
    const isTarget = tab.getAttribute('data-nav') === screenId;
    if (isTarget) {
      tab.classList.remove('text-slate-400', 'hover:text-slate-600');
      tab.classList.add('text-[#0284C7]', 'bg-sky-50/80');
    } else {
      tab.classList.remove('text-[#0284C7]', 'bg-sky-50/80');
      tab.classList.add('text-slate-400', 'hover:text-slate-600');
    }
  });

  // Atualiza dados dinâmicos da tela aberta
  if (screenId === 'rastreio') {
    renderAuditScreen();
  } else if (screenId === 'indicadores') {
    renderIndicatorsScreen();
  }

  // Volta scroll interno para o topo
  document.getElementById('screenContainer').scrollTop = 0;
}

function updateHeaderContext() {
  const shortUnit = state.selectedUnit.split(' (')[0];
  const shortRole = state.selectedRole.split(' ')[0];
  document.getElementById('headerContextLabel').textContent = `${shortUnit} • ${shortRole}`;
}

// =========================================================================
// TELA 1: LÓGICA DE ACESSO
// =========================================================================
function selectUnit(unitName) {
  state.selectedUnit = unitName;

  // Sincroniza rota padrão do formulário com a unidade escolhida
  if (unitName.includes('Rota Sul')) {
    selectRota('Rota Sul');
  } else {
    selectRota('Rota Norte');
  }

  document.querySelectorAll('.unit-btn').forEach(btn => {
    const dot = btn.querySelector('.unit-dot');
    if (btn.getAttribute('data-unit') === unitName) {
      btn.classList.remove('border', 'border-slate-200', 'bg-white');
      btn.classList.add('border-2', 'border-[#0284C7]', 'bg-sky-50/70');
      dot.classList.remove('border-2', 'border-slate-300');
      dot.classList.add('border-4', 'border-[#0284C7]');
    } else {
      btn.classList.remove('border-2', 'border-[#0284C7]', 'bg-sky-50/70');
      btn.classList.add('border', 'border-slate-200', 'bg-white');
      dot.classList.remove('border-4', 'border-[#0284C7]');
      dot.classList.add('border-2', 'border-slate-300');
    }
  });
}

function selectRole(roleName) {
  state.selectedRole = roleName;
  const btnOp = document.getElementById('role-operador');
  const btnAu = document.getElementById('role-auditor');

  if (roleName === 'Operador de Coleta') {
    btnOp.className = 'p-2.5 rounded-[10px] border-2 border-[#0284C7] bg-sky-50/70 text-left transition';
    btnOp.querySelector('span:last-child').className = 'w-2 h-2 rounded-full bg-[#0284C7]';
    btnAu.className = 'p-2.5 rounded-[10px] border border-slate-200 bg-white hover:bg-slate-50 text-left transition';
    btnAu.querySelector('span:last-child').className = 'w-2 h-2 rounded-full bg-slate-200';
  } else {
    btnAu.className = 'p-2.5 rounded-[10px] border-2 border-[#0284C7] bg-sky-50/70 text-left transition';
    btnAu.querySelector('span:last-child').className = 'w-2 h-2 rounded-full bg-[#0284C7]';
    btnOp.className = 'p-2.5 rounded-[10px] border border-slate-200 bg-white hover:bg-slate-50 text-left transition';
    btnOp.querySelector('span:last-child').className = 'w-2 h-2 rounded-full bg-slate-200';
  }
}

function enterOperation() {
  const targetScreen = state.selectedRole === 'Auditor / Gestor' ? 'rastreio' : 'registrar';
  navigateTo(targetScreen);
  showToast(`Sessão iniciada: ${state.selectedRole}`, 'blue');
}

// =========================================================================
// TELA 2: LÓGICA DE REGISTRO DE LOTE
// =========================================================================
function selectRota(rota) {
  state.formRota = rota;
  const btnNorte = document.getElementById('btnRotaNorte');
  const btnSul = document.getElementById('btnRotaSul');

  if (rota === 'Rota Norte') {
    btnNorte.className = 'py-2 px-3 rounded-[10px] text-xs font-bold border-2 border-[#0284C7] bg-sky-50 text-[#0284C7] transition';
    btnSul.className = 'py-2 px-3 rounded-[10px] text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition';
  } else {
    btnSul.className = 'py-2 px-3 rounded-[10px] text-xs font-bold border-2 border-[#0284C7] bg-sky-50 text-[#0284C7] transition';
    btnNorte.className = 'py-2 px-3 rounded-[10px] text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition';
  }
}

function selectClassificacao(tipo) {
  state.formClassificacao = tipo;
  const btnAp = document.getElementById('btnClassAproveitavel');
  const btnPe = document.getElementById('btnClassPerda');

  if (tipo === 'Aproveitável') {
    btnAp.className = 'p-2.5 rounded-[10px] border-2 border-[#16A34A] bg-green-50 text-left transition';
    btnPe.className = 'p-2.5 rounded-[10px] border border-slate-200 bg-white hover:bg-orange-50/40 text-left transition';
  } else {
    btnPe.className = 'p-2.5 rounded-[10px] border-2 border-[#EA580C] bg-orange-50 text-left transition';
    btnAp.className = 'p-2.5 rounded-[10px] border border-slate-200 bg-white hover:bg-green-50/40 text-left transition';
  }
}

function autoSuggestClassification() {
  const mat = document.getElementById('inputMaterial').value;
  if (mat.includes('Rejeito') || mat.includes('Desvio')) {
    selectClassificacao('Perda / Contaminado');
  } else {
    selectClassificacao('Aproveitável');
  }
}

function adjustWeight(delta) {
  const input = document.getElementById('inputPeso');
  const current = parseInt(input.value || '0', 10);
  input.value = Math.max(50, current + delta);
}

function fillPresetSample() {
  const nextNum = String(state.batches.length + 1).padStart(3, '0');
  const prefix = state.formRota === 'Rota Sul' ? 'SUL-NOT' : 'NORTE-DIU';
  document.getElementById('inputCodigo').value = `${prefix}-${nextNum}`;
  document.getElementById('inputMaterial').value = 'Plástico PET e Papelão';
  document.getElementById('inputPeso').value = 600;
  selectClassificacao('Aproveitável');
  showToast('Dados de exemplo preenchidos!', 'blue');
}

function handleRegisterBatch(event) {
  event.preventDefault();
  const rawCode = document.getElementById('inputCodigo').value.trim().toUpperCase();
  const material = document.getElementById('inputMaterial').value;
  const peso = parseInt(document.getElementById('inputPeso').value, 10);

  if (!rawCode || isNaN(peso) || peso <= 0) {
    showToast('Informe um código válido e peso maior que zero.', 'orange');
    return;
  }

  const isAproveitavel = state.formClassificacao === 'Aproveitável';
  const valorKg = !isAproveitavel ? 0 : (material.includes('PET') ? 1.45 : 1.10);
  const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
  const randomHexEnd = Math.random().toString(16).substring(2, 6).toUpperCase();

  const origemLabel = state.formRota === 'Rota Norte'
    ? 'EMLURB - Rota Norte (Av. Norte / Casa Amarela, Recife)'
    : 'EMLURB - Rota Sul (Av. Boa Viagem / Pina, Recife)';

  const newBatch = {
    codigo: rawCode,
    material: material,
    peso: peso,
    rota: state.formRota,
    origem: origemLabel,
    destino: isAproveitavel ? 'Cooperativa Recicla Recife' : 'Aterro Controlado / Alerta de Perda',
    classificacao: state.formClassificacao,
    valorKg: valorKg,
    timestamp: 'Agora mesmo',
    hash: `0x${randomHex}...${randomHexEnd}`
  };

  // Substitui se mesmo código ou insere no topo da lista da sessão
  const existingIndex = state.batches.findIndex(b => b.codigo === rawCode);
  if (existingIndex >= 0) {
    state.batches[existingIndex] = newBatch;
  } else {
    state.batches.unshift(newBatch);
  }

  state.selectedAuditCodigo = newBatch.codigo;

  // Prepara próximo código sugerido
  const nextCount = String(state.batches.length + 1).padStart(3, '0');
  document.getElementById('inputCodigo').value = `NORTE-DIU-${nextCount}`;

  navigateTo('rastreio');
  showToast(
    isAproveitavel
      ? `Lote ${newBatch.codigo} auditado e enviado à cooperativa!`
      : `Alerta registrado: ${newBatch.codigo} marcado como perda.`,
    isAproveitavel ? 'green' : 'orange'
  );
}

// =========================================================================
// TELA 3: RASTREIO & AUDITORIA + GRAFO INTERATIVO NEO4J
// =========================================================================
function renderAuditScreen() {
  const selectEl = document.getElementById('auditBatchSelect');
  selectEl.innerHTML = state.batches.map(b => {
    const icon = b.classificacao === 'Aproveitável' ? '🟢' : '🟠';
    return `<option value="${b.codigo}" ${b.codigo === state.selectedAuditCodigo ? 'selected' : ''}>
      ${icon} ${b.codigo} — ${b.material} (${formatNumberBR(b.peso)} kg)
    </option>`;
  }).join('');

  const batch = state.batches.find(b => b.codigo === state.selectedAuditCodigo) || state.batches[0];
  state.selectedAuditCodigo = batch.codigo;

  const isAproveitavel = batch.classificacao === 'Aproveitável';
  const badgeEl = document.getElementById('auditStatusBadge');

  if (isAproveitavel) {
    badgeEl.className = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-[11px] font-extrabold bg-green-100 text-[#16A34A]';
    badgeEl.textContent = '✓ Origem Comprovada';
  } else {
    badgeEl.className = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-[10px] text-[11px] font-extrabold bg-orange-100 text-[#EA580C]';
    badgeEl.textContent = '⚠ Alerta de Perda / Opacidade Bloqueada';
  }

  document.getElementById('auditBatchCode').textContent = batch.codigo;
  document.getElementById('auditBatchMaterial').textContent = batch.material;
  document.getElementById('auditBatchHash').textContent = batch.hash;
  document.getElementById('auditBatchWeight').textContent = `${formatNumberBR(batch.peso)} kg`;

  const payoutEl = document.getElementById('auditBatchPayout');
  if (isAproveitavel) {
    const totalPayout = batch.peso * batch.valorKg;
    payoutEl.className = 'text-sm font-extrabold text-[#16A34A]';
    payoutEl.textContent = formatCurrencyBR(totalPayout);
  } else {
    payoutEl.className = 'text-sm font-extrabold text-[#EA580C]';
    payoutEl.textContent = 'R$ 0,00 (Retido)';
  }

  document.getElementById('auditBatchRoute').textContent = `📍 ${batch.rota} • EMLURB`;
  document.getElementById('auditBatchTime').textContent = batch.timestamp;

  // Atualiza cores dos nós do grafo conforme classificação do lote
  const nodeLoteCircle = document.getElementById('nodeLoteCircle');
  const nodeLoteTag = document.getElementById('nodeLoteTag');
  const nodeDestinoCircle = document.getElementById('nodeDestinoCircle');
  const nodeDestinoTitle = document.getElementById('nodeDestinoTitle');

  if (isAproveitavel) {
    nodeLoteCircle.className = 'w-8 h-8 rounded-full bg-[#16A34A] text-white text-xs font-extrabold flex items-center justify-center shadow-xs';
    nodeLoteTag.className = 'text-[9px] font-mono text-[#16A34A]';
    nodeLoteTag.textContent = ':LoteAuditado';
    nodeDestinoCircle.className = 'w-8 h-8 rounded-full bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center shadow-xs';
    nodeDestinoCircle.textContent = '♻️';
    nodeDestinoTitle.textContent = 'Destino Coop.';
  } else {
    nodeLoteCircle.className = 'w-8 h-8 rounded-full bg-[#EA580C] text-white text-xs font-extrabold flex items-center justify-center shadow-xs';
    nodeLoteTag.className = 'text-[9px] font-mono text-[#EA580C]';
    nodeLoteTag.textContent = ':AlertaPerda';
    nodeDestinoCircle.className = 'w-8 h-8 rounded-full bg-orange-700 text-white text-xs font-extrabold flex items-center justify-center shadow-xs';
    nodeDestinoCircle.textContent = '🚫';
    nodeDestinoTitle.textContent = 'Descarte / Desvio';
  }

  inspectGraphNode(state.selectedGraphNode);
}

function selectAuditBatch(codigo) {
  state.selectedAuditCodigo = codigo;
  renderAuditScreen();
}

function inspectGraphNode(nodeKey) {
  state.selectedGraphNode = nodeKey;
  const batch = state.batches.find(b => b.codigo === state.selectedAuditCodigo) || state.batches[0];

  // Destaca botão do nó ativo
  ['origem', 'rota', 'lote', 'destino'].forEach(key => {
    const el = document.getElementById(`node-${key}`);
    if (key === nodeKey) {
      el.classList.add('border-2', 'border-[#0284C7]', 'neo4j-node-active');
      el.classList.remove('border', 'border-slate-200');
    } else {
      el.classList.remove('border-2', 'border-[#0284C7]', 'neo4j-node-active');
      el.classList.add('border', 'border-slate-200');
    }
  });

  const inspector = document.getElementById('neo4jInspectorBox');
  if (nodeKey === 'origem') {
    inspector.innerHTML = `
      <span class="text-sky-400">MATCH (o:Organizacao)</span><br/>
      nome: <span class="text-emerald-300">"${batch.origem.split(' (')[0]}"</span><br/>
      local: <span class="text-amber-300">"Recife - PE"</span> • status: <span class="text-emerald-400">"VERIFICADO"</span>
    `;
  } else if (nodeKey === 'rota') {
    inspector.innerHTML = `
      <span class="text-sky-400">MATCH (o)-[:COLETADO_EM]->(r:RotaColeta)</span><br/>
      rota: <span class="text-emerald-300">"${batch.rota}"</span> • registro: <span class="text-amber-300">"${batch.timestamp}"</span><br/>
      rastreioGPS: <span class="text-emerald-400">true</span>
    `;
  } else if (nodeKey === 'lote') {
    const statusColor = batch.classificacao === 'Aproveitável' ? 'text-emerald-400' : 'text-orange-400';
    inspector.innerHTML = `
      <span class="text-sky-400">MATCH (r)-[:RASTREADO_POR]->(l:Lote)</span><br/>
      codigo: <span class="text-emerald-300">"${batch.codigo}"</span> • pesoKg: <span class="text-amber-300">${batch.peso}</span><br/>
      status: <span class="${statusColor}">"${batch.classificacao.toUpperCase()}"</span>
    `;
  } else {
    const repasse = batch.classificacao === 'Aproveitável'
      ? formatCurrencyBR(batch.peso * batch.valorKg)
      : 'R$ 0,00 (Bloqueado)';
    inspector.innerHTML = `
      <span class="text-sky-400">MATCH (l)-[:DESTINADO_A]->(d:DestinoFinal)</span><br/>
      unidade: <span class="text-emerald-300">"${batch.destino}"</span><br/>
      repasseJusto: <span class="text-amber-300">"${repasse}"</span>
    `;
  }
}

// =========================================================================
// TELA 4: INDICADORES EXECUTIVOS EM TEMPO REAL
// =========================================================================
function renderIndicatorsScreen() {
  const totalKg = state.batches.reduce((acc, b) => acc + b.peso, 0);
  const aproveitavelKg = state.batches
    .filter(b => b.classificacao === 'Aproveitável')
    .reduce((acc, b) => acc + b.peso, 0);
  const perdasKg = totalKg - aproveitavelKg;

  const taxaAproveitamento = totalKg > 0 ? ((aproveitavelKg / totalKg) * 100) : 0;
  const taxaPerdas = totalKg > 0 ? ((perdasKg / totalKg) * 100) : 0;

  document.getElementById('kpiPesoTotal').textContent = `${formatNumberBR(totalKg)} kg`;
  document.getElementById('kpiTotalLotes').textContent = `${state.batches.length} Lotes`;
  document.getElementById('kpiTaxaAproveitamento').textContent = `${taxaAproveitamento.toFixed(1).replace('.', ',')}%`;
  document.getElementById('kpiPesoAproveitavel').textContent = `${formatNumberBR(aproveitavelKg)} kg`;
  document.getElementById('kpiTaxaPerdas').textContent = `${taxaPerdas.toFixed(1).replace('.', ',')}%`;
  document.getElementById('kpiPesoPerdido').textContent = `${formatNumberBR(perdasKg)} kg`;

  // Mostra botão de restaurar base caso novos lotes tenham sido adicionados
  const resetBtn = document.getElementById('btnResetDemo');
  if (state.batches.length !== INITIAL_BATCHES.length || totalKg !== 3000) {
    resetBtn.classList.remove('hidden');
  } else {
    resetBtn.classList.add('hidden');
  }

  // Agrupa pesos por material para as barras de progresso
  const materialMap = {};
  state.batches.forEach(b => {
    if (!materialMap[b.material]) {
      materialMap[b.material] = {
        peso: 0,
        classificacao: b.classificacao
      };
    }
    materialMap[b.material].peso += b.peso;
  });

  const sortedMaterials = Object.entries(materialMap).sort((a, b) => b[1].peso - a[1].peso);
  const progressContainer = document.getElementById('materialProgressList');

  progressContainer.innerHTML = sortedMaterials.map(([matName, info], index) => {
    const pct = totalKg > 0 ? Math.round((info.peso / totalKg) * 100) : 0;
    let barColor = 'bg-[#16A34A]';
    if (info.classificacao !== 'Aproveitável') {
      barColor = 'bg-[#EA580C]';
    } else if (index === 1) {
      barColor = 'bg-[#0284C7]';
    }

    return `
      <div>
        <div class="flex items-center justify-between text-[11px] mb-1">
          <span class="font-semibold text-slate-700 truncate pr-2">${matName}</span>
          <span class="font-extrabold text-slate-800 shrink-0">${formatNumberBR(info.peso)} kg <span class="text-slate-400 font-medium">(${pct}%)</span></span>
        </div>
        <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full ${barColor} rounded-full transition-all duration-500" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  }).join('');

  // Lista clicável dos lotes
  const listContainer = document.getElementById('kpiClickableBatchList');
  listContainer.innerHTML = state.batches.map(b => {
    const isOk = b.classificacao === 'Aproveitável';
    const pillClass = isOk
      ? 'bg-green-100 text-[#16A34A]'
      : 'bg-orange-100 text-[#EA580C]';
    const weightClass = isOk ? 'text-[#16A34A]' : 'text-[#EA580C]';

    return `
      <button type="button" onclick="openBatchFromIndicators('${b.codigo}')"
        class="w-full py-2.5 flex items-center justify-between text-left hover:bg-slate-50/80 transition group">
        <div class="min-w-0 pr-2">
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-extrabold text-slate-800 group-hover:text-[#0284C7] transition">${b.codigo}</span>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded ${pillClass}">
              ${isOk ? 'Auditado' : 'Perda'}
            </span>
          </div>
          <p class="text-[11px] text-slate-500 truncate mt-0.5">${b.material} • ${b.rota}</p>
        </div>
        <div class="text-right shrink-0">
          <span class="text-xs font-extrabold ${weightClass}">${formatNumberBR(b.peso)} kg</span>
          <span class="block text-[10px] text-slate-400">Ver grafo ›</span>
        </div>
      </button>
    `;
  }).join('');
}

function openBatchFromIndicators(codigo) {
  state.selectedAuditCodigo = codigo;
  navigateTo('rastreio');
}

function resetInitialData() {
  state.batches = JSON.parse(JSON.stringify(INITIAL_BATCHES));
  state.selectedAuditCodigo = 'NORTE-DIU-001';
  renderIndicatorsScreen();
  showToast('Base inicial de 3.000 kg restaurada!', 'blue');
}

// Inicialização ao carregar
window.addEventListener('DOMContentLoaded', () => {
  renderAuditScreen();
  renderIndicatorsScreen();
});
