'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { Users, Plus, Search, MapPin, ExternalLink, ChevronRight, Building2, Mail, Phone, Globe, X, Edit2, Trash2, GitBranch } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Agent, Branch } from '@/lib/supabase'

const STATUS_COLORS: Record<string, string> = {
  Active: 'badge-success',
  Inactive: 'badge-danger',
  Prospect: 'badge-warning',
}

function AgentModal({ agent, onClose, onSave }: { agent: Agent | null, onClose: () => void, onSave: (a: Agent) => void }) {
  const blank: Partial<Agent> = { name:'', country:'', city:'', status:'Active', website:'', account_manager:'', notes:'' }
  const [form, setForm] = useState<Partial<Agent>>(agent || blank)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.name || !form.country) return
    setSaving(true)
    try {
      if (agent?.id) {
        const { data } = await supabase.from('agents').update(form).eq('id', agent.id).select().single()
        if (data) onSave(data)
      } else {
        const { data } = await supabase.from('agents').insert(form).select().single()
        if (data) onSave(data)
      }
    } finally { setSaving(false) }
  }

  const F = (key: keyof Agent, label: string, opts?: { type?: string, placeholder?: string, options?: string[] }) => (
    <div style={{marginBottom:16}}>
      <label className="form-label">{label}</label>
      {opts?.options ? (
        <select className="form-select" value={(form[key] as string) || ''} onChange={e => setForm({...form, [key]: e.target.value})}>
          {opts.options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input className="form-input" type={opts?.type || 'text'} placeholder={opts?.placeholder || ''} 
          value={(form[key] as string) || ''} onChange={e => setForm({...form, [key]: e.target.value})}/>
      )}
    </div>
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-in" onClick={e => e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
          <div style={{fontWeight:700, fontSize:17}}>{agent ? 'Edit Agent' : 'Add Agent'}</div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer'}}><X size={18}/></button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px'}}>
          <div style={{gridColumn:'1/-1'}}>{F('name','Agency Name',{placeholder:'e.g. Global Education Partners'})}</div>
          {F('country','Country',{placeholder:'e.g. Nigeria'})}
          {F('city','City',{placeholder:'e.g. Lagos'})}
          {F('status','Status',{options:['Active','Inactive','Prospect']})}
          {F('account_manager','Account Manager',{placeholder:'e.g. Sarah Ahmed'})}
          {F('website','Website',{placeholder:'https://...'})}
          <div style={{gridColumn:'1/-1'}}>
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={3} placeholder="Internal notes..."
              value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})}
              style={{resize:'vertical'}}/>
          </div>
        </div>
        <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:20}}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : (agent ? 'Save Changes' : 'Add Agent')}
          </button>
        </div>
      </div>
    </div>
  )
}

function BranchModal({ agentId, branch, onClose, onSave }: { agentId: string, branch: Branch | null, onClose: () => void, onSave: (b: Branch) => void }) {
  const blank: Partial<Branch> = { agent_id: agentId, city:'', country:'', address:'', contact_name:'', contact_email:'', contact_phone:'', is_main: false, notes:'' }
  const [form, setForm] = useState<Partial<Branch>>(branch || blank)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.city || !form.country) return
    setSaving(true)
    try {
      if (branch?.id) {
        const { data } = await supabase.from('branches').update(form).eq('id', branch.id).select().single()
        if (data) onSave(data)
      } else {
        const { data } = await supabase.from('branches').insert({...form, agent_id: agentId}).select().single()
        if (data) onSave(data)
      }
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-in" onClick={e => e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
          <div style={{fontWeight:700, fontSize:17}}>{branch ? 'Edit Branch' : 'Add Branch'}</div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer'}}><X size={18}/></button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px'}}>
          {[
            ['country','Country','Country'],['city','City','City'],
            ['address','Address','Full address'],['contact_name','Contact Name','Full name'],
            ['contact_email','Contact Email','email@...'],['contact_phone','Phone','+ country code'],
          ].map(([k,l,p]) => (
            <div key={k} style={{marginBottom:16, gridColumn: k==='address' ? '1/-1' : 'auto'}}>
              <label className="form-label">{l}</label>
              <input className="form-input" placeholder={p} value={(form as Record<string,string|boolean>)[k] as string || ''} onChange={e => setForm({...form, [k]: e.target.value})}/>
            </div>
          ))}
          <div style={{gridColumn:'1/-1', marginBottom:16}}>
            <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
              <input type="checkbox" checked={!!form.is_main} onChange={e => setForm({...form, is_main: e.target.checked})} style={{accentColor:'var(--sky)'}}/>
              <span style={{fontSize:13, color:'var(--text-secondary)'}}>This is the main / head office</span>
            </label>
          </div>
          <div style={{gridColumn:'1/-1', marginBottom:16}}>
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={2} value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} style={{resize:'vertical'}}/>
          </div>
        </div>
        <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:8}}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : (branch ? 'Save Changes' : 'Add Branch')}</button>
        </div>
      </div>
    </div>
  )
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [selected, setSelected] = useState<Agent | null>(null)
  const [tab, setTab] = useState<'overview'|'branches'|'notes'>('overview')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [showAddAgent, setShowAddAgent] = useState(false)
  const [showAddBranch, setShowAddBranch] = useState(false)
  const [editAgent, setEditAgent] = useState<Agent|null>(null)
  const [editBranch, setEditBranch] = useState<Branch|null>(null)

  useEffect(() => {
    loadAgents()
  }, [])

  async function loadAgents() {
    setLoading(true)
    const { data } = await supabase.from('agents').select('*').order('name')
    setAgents(data || [])
    setLoading(false)
  }

  async function loadBranches(agentId: string) {
    const { data } = await supabase.from('branches').select('*').eq('agent_id', agentId)
    setBranches(data || [])
  }

  function selectAgent(a: Agent) {
    setSelected(a); setTab('overview')
    loadBranches(a.id)
  }

  async function deleteAgent(id: string) {
    if (!confirm('Delete this agent and all their branches?')) return
    await supabase.from('agents').delete().eq('id', id)
    setAgents(prev => prev.filter(a => a.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const filtered = agents.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = a.name.toLowerCase().includes(q) || a.country.toLowerCase().includes(q) || (a.city || '').toLowerCase().includes(q)
    const matchStatus = statusFilter === 'All' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const agentBranches = branches.filter(b => b.agent_id === selected?.id)

  return (
    <div style={{display:'flex', height:'100vh', overflow:'hidden'}}>
      {/* Left panel */}
      <div style={{width:340, borderRight:'1px solid var(--midnight-border)', display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden'}}>
        {/* Header */}
        <div style={{padding:'20px 16px 14px', borderBottom:'1px solid var(--midnight-border)'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
            <div style={{fontWeight:700, fontSize:16, display:'flex', alignItems:'center', gap:8}}>
              <Users size={16} style={{color:'var(--sky)'}}/>
              Agents
              <span style={{background:'var(--midnight)', border:'1px solid var(--midnight-border)', borderRadius:20, padding:'1px 8px', fontSize:11, fontWeight:600, color:'var(--text-muted)'}}>
                {filtered.length}
              </span>
            </div>
            <button className="btn-primary" onClick={() => setShowAddAgent(true)} style={{padding:'6px 12px', fontSize:12}}>
              <Plus size={13}/> Add
            </button>
          </div>
          <div className="search-bar" style={{marginBottom:8}}>
            <Search size={14} style={{color:'var(--text-muted)', flexShrink:0}}/>
            <input placeholder="Search agents..." value={search} onChange={e => setSearch(e.target.value)}/>
            {search && <button onClick={() => setSearch('')} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer'}}><X size={12}/></button>}
          </div>
          <div style={{display:'flex', gap:4}}>
            {['All','Active','Inactive','Prospect'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding:'4px 10px', borderRadius:16, fontSize:11, fontWeight:600, cursor:'pointer', border:'none',
                background: statusFilter===s ? 'var(--sky)' : 'var(--midnight)',
                color: statusFilter===s ? 'var(--midnight)' : 'var(--text-muted)',
                transition:'all 0.15s'
              }}>{s}</button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{flex:1, overflowY:'auto'}}>
          {loading ? (
            <div className="empty-state"><div className="spinner" style={{width:20,height:20,border:'2px solid var(--midnight-border)',borderTopColor:'var(--sky)',borderRadius:'50%'}}/></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Users size={32} className="icon"/>
              <div style={{fontWeight:600, color:'var(--text-secondary)'}}>No agents found</div>
              <p>Add your first agent or try a different search.</p>
            </div>
          ) : filtered.map(agent => (
            <div key={agent.id} className="table-row" style={{
              gridTemplateColumns:'1fr auto',
              background: selected?.id === agent.id ? 'rgba(56,189,248,0.06)' : undefined,
              borderLeft: selected?.id === agent.id ? '3px solid var(--sky)' : '3px solid transparent',
            }} onClick={() => selectAgent(agent)}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <div style={{
                  width:36, height:36, borderRadius:8, background:'var(--midnight)',
                  border:'1px solid var(--midnight-border)', display:'flex', alignItems:'center', justifyContent:'center',
                  fontWeight:700, fontSize:13, color:'var(--sky)', flexShrink:0
                }}>
                  {agent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{fontWeight:600, fontSize:13, marginBottom:2}}>{agent.name}</div>
                  <div style={{color:'var(--text-muted)', fontSize:11, display:'flex', alignItems:'center', gap:4}}>
                    <MapPin size={10}/>{agent.city ? `${agent.city}, ` : ''}{agent.country}
                  </div>
                </div>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:6}}>
                <span className={`badge ${STATUS_COLORS[agent.status]}`}>{agent.status}</span>
                <ChevronRight size={14} style={{color:'var(--text-muted)'}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right detail panel */}
      <div style={{flex:1, overflowY:'auto'}}>
        {!selected ? (
          <div className="empty-state" style={{marginTop:80}}>
            <Users size={48} className="icon"/>
            <div style={{fontWeight:600, color:'var(--text-secondary)', fontSize:16}}>Select an agent</div>
            <p>Choose an agent from the list to view their details, contacts, and branches.</p>
          </div>
        ) : (
          <div className="animate-in">
            {/* Agent header */}
            <div style={{padding:'24px 28px', borderBottom:'1px solid var(--midnight-border)', display:'flex', alignItems:'flex-start', justifyContent:'space-between'}}>
              <div style={{display:'flex', gap:14, alignItems:'center'}}>
                <div style={{
                  width:52, height:52, borderRadius:12, background:'rgba(56,189,248,0.1)',
                  border:'1px solid rgba(56,189,248,0.2)', display:'flex', alignItems:'center', justifyContent:'center',
                  fontWeight:700, fontSize:20, color:'var(--sky)'
                }}>
                  {selected.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{fontWeight:700, fontSize:18, marginBottom:4}}>{selected.name}</div>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <span className={`badge ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
                    <span style={{color:'var(--text-muted)', fontSize:12, display:'flex', alignItems:'center', gap:4}}>
                      <MapPin size={11}/>{selected.city ? `${selected.city}, ` : ''}{selected.country}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{display:'flex', gap:8}}>
                <button className="btn-ghost" style={{padding:'7px 12px'}} onClick={() => setEditAgent(selected)}><Edit2 size={14}/> Edit</button>
                <button className="btn-danger" style={{padding:'7px 12px'}} onClick={() => deleteAgent(selected.id)}><Trash2 size={14}/></button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{padding:'16px 28px 0', borderBottom:'1px solid var(--midnight-border)'}}>
              <div className="tab-bar" style={{width:'fit-content'}}>
                {(['overview','branches','notes'] as const).map(t => (
                  <button key={t} className={`tab${tab===t?' active':''}`} onClick={() => setTab(t)}>
                    {t === 'branches' ? `Branches (${agentBranches.length})` : t.charAt(0).toUpperCase()+t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{padding:'24px 28px'}}>
              {tab === 'overview' && (
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
                  {[
                    {icon: Globe, label:'Website', value: selected.website || '—', href: selected.website},
                    {icon: Users, label:'Account Manager', value: selected.account_manager || '—'},
                    {icon: MapPin, label:'Country', value: selected.country},
                    {icon: Building2, label:'City', value: selected.city || '—'},
                  ].map(({icon: Icon, label, value, href}) => (
                    <div key={label} className="card" style={{padding:'14px 16px'}}>
                      <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:6}}>
                        <Icon size={13} style={{color:'var(--sky)'}}/>
                        <span className="form-label" style={{margin:0}}>{label}</span>
                      </div>
                      {href ? (
                        <a href={href} target="_blank" rel="noopener noreferrer" style={{color:'var(--sky)', fontSize:13, textDecoration:'none', display:'flex', alignItems:'center', gap:4}}>
                          {value}<ExternalLink size={11}/>
                        </a>
                      ) : <div style={{fontSize:13, fontWeight:600}}>{value}</div>}
                    </div>
                  ))}
                </div>
              )}

              {tab === 'branches' && (
                <div>
                  <div style={{display:'flex', justifyContent:'flex-end', marginBottom:16}}>
                    <button className="btn-primary" onClick={() => setShowAddBranch(true)}>
                      <Plus size={13}/> Add Branch
                    </button>
                  </div>
                  {agentBranches.length === 0 ? (
                    <div className="empty-state">
                      <Building2 size={32} className="icon"/>
                      <div style={{fontWeight:600, color:'var(--text-secondary)'}}>No branches yet</div>
                      <p>Add offices and branches for this agent.</p>
                    </div>
                  ) : agentBranches.map(b => (
                    <div key={b.id} className="card" style={{marginBottom:12, cursor:'pointer'}} onClick={() => setEditBranch(b)}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                        <div>
                          <div style={{fontWeight:600, marginBottom:4, display:'flex', alignItems:'center', gap:8}}>
                            <GitBranch size={13} style={{color:'var(--sky)'}}/>
                            {b.city}, {b.country}
                            {b.is_main && <span className="badge badge-sky" style={{fontSize:10}}>Main Office</span>}
                          </div>
                          {b.address && <div style={{color:'var(--text-muted)', fontSize:12, marginBottom:6}}>{b.address}</div>}
                          <div style={{display:'flex', gap:12}}>
                            {b.contact_name && <span style={{fontSize:12, color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:4}}><Users size={11}/>{b.contact_name}</span>}
                            {b.contact_email && <a href={`mailto:${b.contact_email}`} style={{fontSize:12, color:'var(--sky)', display:'flex', alignItems:'center', gap:4, textDecoration:'none'}}><Mail size={11}/>{b.contact_email}</a>}
                            {b.contact_phone && <span style={{fontSize:12, color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:4}}><Phone size={11}/>{b.contact_phone}</span>}
                          </div>
                        </div>
                        <Edit2 size={13} style={{color:'var(--text-muted)'}}/>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'notes' && (
                <div>
                  <label className="form-label">Internal Notes</label>
                  <textarea className="form-input" rows={8} defaultValue={selected.notes || ''} placeholder="Add notes about this agent..."
                    onBlur={async (e) => {
                      await supabase.from('agents').update({notes: e.target.value}).eq('id', selected.id)
                      setSelected({...selected, notes: e.target.value})
                      setAgents(prev => prev.map(a => a.id === selected.id ? {...a, notes: e.target.value} : a))
                    }}
                    style={{resize:'vertical'}}/>
                  <p style={{fontSize:11, color:'var(--text-muted)', marginTop:6}}>Changes save automatically when you click away.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {(showAddAgent || editAgent) && (
        <AgentModal
          agent={editAgent}
          onClose={() => { setShowAddAgent(false); setEditAgent(null) }}
          onSave={(a) => {
            if (editAgent) {
              setAgents(prev => prev.map(x => x.id === a.id ? a : x))
              setSelected(a)
            } else {
              setAgents(prev => [...prev, a].sort((x,y) => x.name.localeCompare(y.name)))
            }
            setShowAddAgent(false); setEditAgent(null)
          }}
        />
      )}
      {(showAddBranch || editBranch) && selected && (
        <BranchModal
          agentId={selected.id}
          branch={editBranch}
          onClose={() => { setShowAddBranch(false); setEditBranch(null) }}
          onSave={(b) => {
            if (editBranch) {
              setBranches(prev => prev.map(x => x.id === b.id ? b : x))
            } else {
              setBranches(prev => [...prev, b])
            }
            setShowAddBranch(false); setEditBranch(null)
          }}
        />
      )}
    </div>
  )
}
