// Demo backend for the Risk Manager: the same functions as rm-supabase.js (without the Supabase client), data in this browser only.
// scripts/risk-manager-demo.py swaps it in for rm-supabase.js and builds tools/risk-manager/demo/.
// No login, no server, no AI. "Reset demo" (the logout button) restores the example register.

const KEY = 'atinote-rm-demo-v1';
const ME = 'demo-you';
const SESSION = { user: { id: ME, email: 'you@example.com' } };

const clone = x => (x == null ? x : structuredClone(x));
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();

function day(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

// Example register. Dates are relative to today, so the demo never looks stale.
function seed() {
  const reg = { id: id(), title: 'Product launch (demo)', owner_name: 'You', created_at: now(), updated_at: now() };
  const areaRows = [
    ['A01', 'Development'], ['A02', 'Supply chain'], ['A03', 'Certification'], ['A04', 'Market launch'],
  ].map(([code, title], i) => ({ id: id(), register_id: reg.id, code, title, sort_order: i + 1, created_at: now(), updated_at: now() }));
  const area = code => areaRows.find(a => a.code === code).id;
  const people = [
    { id: ME, display_name: 'You', email: 'you@example.com', can_create_registers: true },
    { id: 'demo-lena', display_name: 'Lena Graf', email: 'lena@example.com', can_create_registers: false },
    { id: 'demo-marco', display_name: 'Marco Rossi', email: 'marco@example.com', can_create_registers: false },
    { id: 'demo-sara', display_name: 'Sara Novak', email: 'sara@example.com', can_create_registers: false },
    { id: 'demo-jonas', display_name: 'Jonas Berg', email: 'jonas@example.com', can_create_registers: false },
  ];
  const members = [
    { register_id: reg.id, user_id: ME, role: 'owner' },
    { register_id: reg.id, user_id: 'demo-lena', role: 'editor' },
    { register_id: reg.id, user_id: 'demo-marco', role: 'editor' },
    { register_id: reg.id, user_id: 'demo-sara', role: 'editor' },
    { register_id: reg.id, user_id: 'demo-jonas', role: 'viewer' },
  ];
  // The tool requires a description on save, so every example risk has one.
  const r = (a, title, description, l, i, strategy, status, owner, mitigation, rl, ri, extra = {}) => ({
    area_id: area(a), title, description, likelihood: l, impact: i, strategy, status, owner,
    mitigation, mitigation_owner: owner, residual_likelihood: rl, residual_impact: ri, ...extra,
  });
  const risks = [
    r('A01', 'Firmware not ready for the pilot run',
      'No firmware release has passed system test when the pilot run is due to start.', 4, 4, 'mitigate', 'mitigating', 'Lena Graf',
      'Freeze the scope for the pilot. Remaining features follow in firmware 1.1.', 2, 4,
      { cause: 'Late changes to the feature list', consequence: 'Pilot run moves by four weeks', mitigation_due: day(14) }),
    r('A01', 'Thermal test fails at 45 °C',
      'The housing gets too hot at the top of the specified temperature range.', 3, 4, 'mitigate', 'open', 'Marco Rossi',
      'Run an early thermal test on prototype B. Reserve space for a heat sink in the housing.', 2, 3, { mitigation_due: day(21) }),
    r('A01', 'Key engineer unavailable during ramp-up',
      'The only engineer who knows the test setup is absent during ramp-up.', 2, 3, 'mitigate', 'monitoring', 'Lena Graf',
      'Document the test setup. Train a second engineer on it.', 2, 2, { review_due: day(30) }),
    r('A02', 'Controller chip not delivered on time',
      'The only supplier of the controller chip cannot deliver on time.', 3, 5, 'mitigate', 'mitigating', 'Sara Novak',
      'Qualify a second source. Hold eight weeks of buffer stock.', 2, 4,
      { cause: 'Single source for the main controller chip', triggers: 'Lead time above 20 weeks',
        contingency: 'Ship to launch customers first. Buy missing chips from distributor stock.', mitigation_due: day(90) }),
    r('A02', 'Freight cost rises above plan',
      'Air freight prices rise and shipping the launch volume costs more than planned.', 3, 2, 'transfer', 'monitoring', 'Marco Rossi',
      'Fix the freight rate for the launch volume in the contract with the forwarder.', 1, 2,
      { contingency: 'Move part of the volume to sea freight', review_due: day(60) }),
    r('A02', 'Packaging artwork approved late',
      'Marketing approves the packaging artwork after the print deadline.', 2, 2, 'accept', 'accepted', 'Sara Novak', '', 2, 2),
    r('A03', 'No test lab slot before launch',
      'The external test lab has no free slot before the planned launch date.', 4, 5, 'mitigate', 'open', 'You',
      'Book the lab slot now. Pre-test in house.', 2, 5, { mitigation_due: day(7) }),
    r('A03', 'Standard update changes test requirements',
      'A new edition of the product standard adds tests before certification is done.', 2, 4, 'accept', 'monitoring', 'Marco Rossi',
      '', 2, 4, { triggers: 'Draft of the new edition published', review_due: day(90) }),
    r('A04', 'Sales team not trained in time',
      'Sales starts selling before the team knows the product and its limits.', 3, 3, 'mitigate', 'mitigating', 'You',
      'Hold two training sessions before launch. Record them for later hires.', 1, 3, { mitigation_due: day(28) }),
    r('A04', 'Competitor launches a similar product first',
      'A competitor launches a comparable product before ours.', 2, 4, 'accept', 'monitoring', 'You', '', 2, 4,
      { triggers: 'Competitor announces a launch date', review_due: day(30) }),
    r('A04', 'Launch date clashes with a trade fair',
      'The launch falls into the week of the main trade fair, when sales and customers are busy there.', 2, 3, 'avoid', 'closed', 'Lena Graf',
      'Launch moved to the week after the fair.', 1, 3),
  ].map((x, n) => withScores({
    id: id(), register_id: reg.id, recorded_at: day(-40 + n), recorded_by: ME,
    recorded_by_name: 'You', created_at: new Date(Date.now() - (40 - n) * 864e5).toISOString(), updated_at: now(), ...x,
  }));
  return { registers: [reg], members, profiles: people, areas: areaRows, risks };
}

function withScores(row) {
  const s = (a, b) => (a && b ? a * b : null);
  return { ...row, score: s(row.likelihood, row.impact), residual_score: s(row.residual_likelihood, row.residual_impact) };
}

let db = null;
function load() {
  if (db) return db;
  try { db = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) { db = null; }
  if (!db) { db = seed(); save(); }
  return db;
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (_) {}
}
function touch(registerId) {
  const reg = load().registers.find(r => r.id === registerId);
  if (reg) reg.updated_at = now();
}

// ── Auth: always signed in as "You" ─────────────────────────────────────────

export async function signUp() { return { session: SESSION }; }
export async function signIn() { return { session: SESSION }; }
export async function signOut() {
  try { localStorage.removeItem(KEY); } catch (_) {}
  location.reload();
}
export async function getSession() { return clone(SESSION); }
export async function updatePassword() { return {}; }
export async function requestPasswordReset() {}
export async function saveDisplayName(name) {
  const p = load().profiles.find(x => x.id === ME);
  if (p && name) { p.display_name = String(name).trim().slice(0, 80); save(); }
}
export function getAuthLinkType() { return null; }
export function getAuthTokenHash() { return null; }
export async function verifyTokenHash() { return clone(SESSION); }
export function getAuthErrorFromUrl() { return null; }
export function clearAuthCallbackUrl() {}
export function onAuthChange() {}

// ── Registers & members ─────────────────────────────────────────────────────

export async function listRegisters() {
  const d = load();
  return d.members.filter(m => m.user_id === ME)
    .map(m => ({ ...clone(d.registers.find(r => r.id === m.register_id)), role: m.role }))
    .filter(r => r.id);
}

export async function createRegister(title, ownerName) {
  const d = load();
  const row = { id: id(), title, owner_name: ownerName || null, created_at: now(), updated_at: now() };
  d.registers.push(row);
  d.members.push({ register_id: row.id, user_id: ME, role: 'owner' });
  save();
  return clone(row);
}

export async function updateRegister(registerId, patch) {
  const reg = load().registers.find(r => r.id === registerId);
  if (reg) { Object.assign(reg, patch, { updated_at: now() }); save(); }
}

export async function deleteRegister(registerId) {
  const d = load();
  d.registers = d.registers.filter(r => r.id !== registerId);
  d.members = d.members.filter(m => m.register_id !== registerId);
  d.areas = d.areas.filter(a => a.register_id !== registerId);
  d.risks = d.risks.filter(r => r.register_id !== registerId);
  save();
}

export async function loadRegisterData(registerId) {
  const d = load();
  const areas = d.areas.filter(a => a.register_id === registerId)
    .sort((a, b) => (a.sort_order - b.sort_order) || String(a.code || '').localeCompare(String(b.code || '')));
  const risks = d.risks.filter(r => r.register_id === registerId)
    .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
  return { areas: clone(areas), risks: clone(risks) };
}

export async function listMembers(registerId) {
  return clone(load().members.filter(m => m.register_id === registerId).map(({ user_id, role }) => ({ user_id, role })));
}

export async function loadProfiles(userIds) {
  return clone(load().profiles.filter(p => userIds.includes(p.id)));
}

export async function loadMyProfile() {
  return clone(load().profiles.find(p => p.id === ME));
}

export async function updateMemberRole(registerId, userId, role) {
  if (role !== 'editor' && role !== 'viewer') throw new Error('Invalid role');
  const m = load().members.find(x => x.register_id === registerId && x.user_id === userId);
  if (!m || userId === ME) throw new Error('Could not change role (owner only, not your own row)');
  m.role = role;
  save();
}

export async function removeMember(registerId, userId) {
  const d = load();
  if (userId === ME) throw new Error('Could not remove member (owner only, not your own row)');
  d.members = d.members.filter(x => !(x.register_id === registerId && x.user_id === userId));
  save();
}

// The live tool sends an email invitation. The demo only adds the person to the list.
export async function inviteMemberByEmail(registerId, email, role, displayName) {
  const d = load();
  let p = d.profiles.find(x => x.email === email);
  if (!p) {
    p = { id: 'demo-' + id(), display_name: displayName || email.split('@')[0], email, can_create_registers: false };
    d.profiles.push(p);
  }
  if (!d.members.some(m => m.register_id === registerId && m.user_id === p.id)) {
    d.members.push({ register_id: registerId, user_id: p.id, role: role || 'editor' });
  }
  save();
  return { ok: true };
}

// ── Areas ───────────────────────────────────────────────────────────────────

export async function createArea(registerId, code, title, sortOrder) {
  const d = load();
  if (d.areas.some(a => a.register_id === registerId && a.code === code)) throw new Error('This area code already exists');
  const row = { id: id(), register_id: registerId, code, title, sort_order: sortOrder || 0, created_at: now(), updated_at: now() };
  d.areas.push(row);
  touch(registerId);
  save();
  return clone(row);
}

export async function updateArea(areaId, patch) {
  const a = load().areas.find(x => x.id === areaId);
  if (!a) throw new Error('Area not found');
  Object.assign(a, patch, { updated_at: now() });
  touch(a.register_id);
  save();
  return clone(a);
}

export async function deleteArea(areaId) {
  const d = load();
  const a = d.areas.find(x => x.id === areaId);
  d.areas = d.areas.filter(x => x.id !== areaId);
  d.risks.forEach(r => { if (r.area_id === areaId) r.area_id = null; });
  if (a) touch(a.register_id);
  save();
}

// ── Risks ───────────────────────────────────────────────────────────────────

const RISK_WRITABLE = [
  'area_id', 'title', 'description', 'cause', 'consequence',
  'likelihood', 'impact', 'strategy', 'mitigation', 'mitigation_owner',
  'mitigation_due', 'contingency', 'triggers', 'owner', 'status',
  'residual_likelihood', 'residual_impact', 'review_due', 'recorded_at',
  'recorded_by_name',
];

function pick(fields) {
  const out = {};
  for (const k of RISK_WRITABLE) if (k in fields) out[k] = fields[k];
  return out;
}

export async function createRisk(registerId, fields) {
  const d = load();
  const row = withScores({
    id: id(), register_id: registerId, status: 'open', recorded_by: ME,
    created_at: now(), updated_at: now(), ...pick(fields),
  });
  d.risks.push(row);
  touch(registerId);
  save();
  return clone(row);
}

export async function updateRisk(riskId, fields) {
  const d = load();
  const i = d.risks.findIndex(r => r.id === riskId);
  if (i < 0) throw new Error('Risk not found');
  d.risks[i] = withScores({ ...d.risks[i], ...pick(fields), updated_at: now() });
  touch(d.risks[i].register_id);
  save();
  return clone(d.risks[i]);
}

export async function deleteRisk(riskId) {
  const d = load();
  const r = d.risks.find(x => x.id === riskId);
  d.risks = d.risks.filter(x => x.id !== riskId);
  if (r) touch(r.register_id);
  save();
}

// ── Coach ───────────────────────────────────────────────────────────────────

export async function askRiskBot(registerId, message, history) {
  const reply = 'This demo has no AI coach. Your message stays in this browser.';
  return { reply, history: [...(history || []), { role: 'user', content: message }, { role: 'assistant', content: reply }] };
}

// ── Realtime: nothing to sync, everything stays in this browser ─────────────

export function subscribeToRegister(registerId, handlers) {
  handlers.onStatus?.('SUBSCRIBED');
  return null;
}
export function unsubscribe() {}
