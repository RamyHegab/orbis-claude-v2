'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { GraduationCap, Plus, Search, MapPin, X, Edit2, Trash2, Globe, Mail, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { School } from '@/lib/supabase'

const SCHOOL_TYPES = ['Secondary School','Sixth Form','College','Language School','Foundation','University','Other']

function SchoolModal({ school, onClose, onSave }: { school: School | null, onClose: () => void, onSave: (s: School) => void }) {
  const blank: Partial<School> = { name:'', country:'', city:'', type:'Secondary School', website:'', contact_name:'', contact_email:'', notes:'' }
  const [form, setForm] = useState<Partial<School>>(school || blank)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.name || !form.country) return
    setSaving(true)
    try {
      if (school?.id) {
        const { data } = await supabase.from('schools').update(form).eq('id', school.id).select().single()
        if (data) onSave(data)
      } else {
        const { data } = await supabase.from('schools').insert(form).select().single()
        if (data) onSave(data)
      }
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-in" onClick={e => e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
          <div style={{fontWeight:700, fontSize:17}}>{school ? 'Edit School' : 'Add School'}</div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer'}}><X size={18}/></button>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px'}}>
          <div style={{gridColumn:'1/-1', marginBottom:16}}>
            <label className="form-label">School Name *</label>
            <input className="form-input" placeholder="e.g. Lagos International School" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})}/>
          </div>
          {[['country','Country *','e.g. Nigeria'],['city','City *','e.g. Lagos']].map(([k,l,p]) => (
            <div key={k} style={{marginBottom:16}}>
              <label className="form-label">{l}</label>
              <input className="form-input" placeholder={p} value={(form as Record<string,string>)[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})}/>
            </div>
          ))}
          <div style={{marginBottom:16}}>
            <label className="form-label">Type</label>
            <select className="form-select" value={form.type||'Secondary School'} onChange={e=>setForm({...form,type:e.target.value})}>
              {SCHOOL_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          {[['website','Website','https://...'],['contact_name','Contact Name','Full name'],['contact_email','Contact Email','email@school.com']].map(([k,l,p]) => (
            <div key={k} style={{marginBottom:16, gridColumn: k==='website'?'1/-1':'auto'}}>
              <label className="form-label">{l}</label>
              <input className="form-input" placeholder={p} value={(form as Record<string,string>)[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})}/>
            </div>
          ))}
          <div style={{gridColumn:'1/-1', marginBottom:16}}>
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={3} value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} style={{resize:'vertical'}}/>
          </div>
        </div>
        <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:8}}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving...': school ? 'Save Changes':'Add School'}</button>
        </div>
      </div>
    </div>
  )
}

const TYPE_COLORS: Record<string,string> = {
  'Secondary School':'badge-sky','Sixth Form':'badge-sky','College':'badge-warning',
  'Language School':'badge-success','Foundation':'badge-muted','University':'badge-danger','Other':'badge-muted'
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([])
  const [selected, setSelected] = useState<School|null>(null)
  const [search, setSearch] = useState('')
  const [countryFilter, setCountryFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editSchool, setEditSchool] = useState<School|null>(null)

  useEffect(() => { loadSchools() }, [])

  async function loadSchools() {
    setLoading(true)
    const { data } = await supabase.from('schools').select('*').order('name')
    setSchools(data || [])
    setLoading(false)
  }

  async function deleteSchool(id: string) {
    if (!confirm('Delete this school?')) return
    await supabase.from('schools').delete().eq('id', id)
    setSchools(prev => prev.filter(s => s.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const countries = ['All', ...Array.from(new Set(schools.map(s=>s.country))).sort()]
  const filtered = schools.filter(s => {
    const q = search.toLowerCase()
    return (s.name.toLowerCase().includes(q) || s.country.toLowerCase().includes(q) || (s.city||'').toLowerCase().includes(q))
      && (countryFilter==='All' || s.country===countryFilter)
  })

  return (
    <div style={{display:'flex', height:'100vh', overflow:'hidden'}}>
      {/* Left panel */}
      <div style={{width:340, borderRight:'1px solid var(--midnight-border)', display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden'}}>
        <div style={{padding:'20px 16px 14px', borderBottom:'1px solid var(--midnight-border)'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
            <div style={{fontWeight:700, fontSize:16, display:'flex', alignItems:'center', gap:8}}>
              <GraduationCap size={16} style={{color:'var(--success)'}}/>
              Schools
              <span style={{background:'var(--midnight)',border:'1px solid var(--midnight-border)',borderRadius:20,padding:'1px 8px',fontSize:11,fontWeight:600,color:'var(--text-muted)'}}>
                {filtered.length}
              </span>
            </div>
            <button className="btn-primary" onClick={()=>setShowAdd(true)} style={{padding:'6px 12px', fontSize:12}}>
              <Plus size={13}/> Add
            </button>
          </div>
          <div className="search-bar" style={{marginBottom:8}}>
            <Search size={14} style={{color:'var(--text-muted)',flexShrink:0}}/>
            <input placeholder="Search schools..." value={search} onChange={e=>setSearch(e.target.value)}/>
            {search && <button onClick={()=>setSearch('')} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer'}}><X size={12}/></button>}
          </div>
          <select className="form-select" value={countryFilter} onChange={e=>setCountryFilter(e.target.value)} style={{fontSize:12,padding:'6px 10px'}}>
            {countries.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{flex:1, overflowY:'auto'}}>
          {loading ? (
            <div className="empty-state"><div className="spinner" style={{width:20,height:20,border:'2px solid var(--midnight-border)',borderTopColor:'var(--success)',borderRadius:'50%'}}/></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <GraduationCap size={32} className="icon"/>
              <div style={{fontWeight:600,color:'var(--text-secondary)'}}>No schools found</div>
              <p>Add your first school or adjust your search.</p>
            </div>
          ) : filtered.map(s => (
            <div key={s.id} className="table-row" style={{
              gridTemplateColumns:'1fr auto',
              background: selected?.id===s.id ? 'rgba(52,211,153,0.05)' : undefined,
              borderLeft: selected?.id===s.id ? '3px solid var(--success)' : '3px solid transparent',
            }} onClick={()=>setSelected(s)}>
              <div>
                <div style={{fontWeight:600, fontSize:13, marginBottom:2}}>{s.name}</div>
                <div style={{color:'var(--text-muted)', fontSize:11, display:'flex', alignItems:'center', gap:4}}>
                  <MapPin size={10}/>{s.city ? `${s.city}, ` : ''}{s.country}
                </div>
              </div>
              <span className={`badge ${TYPE_COLORS[s.type||'Other']||'badge-muted'}`} style={{fontSize:10}}>{s.type||'Other'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div style={{flex:1, overflowY:'auto'}}>
        {!selected ? (
          <div className="empty-state" style={{marginTop:80}}>
            <GraduationCap size={48} className="icon"/>
            <div style={{fontWeight:600, color:'var(--text-secondary)', fontSize:16}}>Select a school</div>
            <p>Choose a school from the list to view details.</p>
          </div>
        ) : (
          <div className="animate-in">
            <div style={{padding:'24px 28px', borderBottom:'1px solid var(--midnight-border)', display:'flex', alignItems:'flex-start', justifyContent:'space-between'}}>
              <div style={{display:'flex', gap:14, alignItems:'center'}}>
                <div style={{width:52,height:52,borderRadius:12,background:'rgba(52,211,153,0.1)',border:'1px solid rgba(52,211,153,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:20,color:'var(--success)'}}>
                  {selected.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{fontWeight:700, fontSize:18, marginBottom:4}}>{selected.name}</div>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <span className={`badge ${TYPE_COLORS[selected.type||'Other']}`}>{selected.type||'School'}</span>
                    <span style={{color:'var(--text-muted)',fontSize:12,display:'flex',alignItems:'center',gap:4}}><MapPin size={11}/>{selected.city ? `${selected.city}, ` : ''}{selected.country}</span>
                  </div>
                </div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="btn-ghost" style={{padding:'7px 12px'}} onClick={()=>setEditSchool(selected)}><Edit2 size={14}/> Edit</button>
                <button className="btn-danger" style={{padding:'7px 12px'}} onClick={()=>deleteSchool(selected.id)}><Trash2 size={14}/></button>
              </div>
            </div>
            <div style={{padding:'24px 28px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
              {[
                {icon:Globe,label:'Website',value:selected.website||'—',href:selected.website},
                {icon:MapPin,label:'Country',value:selected.country},
                {icon:MapPin,label:'City',value:selected.city||'—'},
                {icon:GraduationCap,label:'Type',value:selected.type||'—'},
                {icon:Mail,label:'Contact Name',value:selected.contact_name||'—'},
                {icon:Mail,label:'Contact Email',value:selected.contact_email||'—',href:selected.contact_email?`mailto:${selected.contact_email}`:undefined},
              ].map(({icon:Icon,label,value,href})=>(
                <div key={label} className="card" style={{padding:'14px 16px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                    <Icon size={13} style={{color:'var(--success)'}}/>
                    <span className="form-label" style={{margin:0}}>{label}</span>
                  </div>
                  {href ? <a href={href} target="_blank" rel="noopener noreferrer" style={{color:'var(--sky)',fontSize:13,textDecoration:'none',display:'flex',alignItems:'center',gap:4}}>{value}<ExternalLink size={11}/></a>
                    : <div style={{fontSize:13,fontWeight:600}}>{value}</div>}
                </div>
              ))}
              {selected.notes && (
                <div className="card" style={{gridColumn:'1/-1',padding:'14px 16px'}}>
                  <span className="form-label">Notes</span>
                  <div style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.7}}>{selected.notes}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {(showAdd || editSchool) && (
        <SchoolModal
          school={editSchool}
          onClose={()=>{setShowAdd(false);setEditSchool(null)}}
          onSave={s=>{
            if(editSchool){setSchools(prev=>prev.map(x=>x.id===s.id?s:x));setSelected(s)}
            else{setSchools(prev=>[...prev,s].sort((a,b)=>a.name.localeCompare(b.name)))}
            setShowAdd(false);setEditSchool(null)
          }}
        />
      )}
    </div>
  )
}
