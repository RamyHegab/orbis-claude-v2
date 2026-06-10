'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { Map, Plus, Calendar, ChevronRight, Globe, X, Clock, CheckCircle, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Trip } from '@/lib/supabase'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'

const STATUS_COLORS: Record<string,string> = {
  Draft:'badge-muted', Approved:'badge-sky', 'In Progress':'badge-warning', Completed:'badge-success'
}
const STATUS_ICONS: Record<string,React.ReactNode> = {
  Draft:<Clock size={12}/>, Approved:<CheckCircle size={12}/>, 'In Progress':<Map size={12}/>, Completed:<CheckCircle size={12}/>
}

function NewTripModal({onClose, onSave}: {onClose:()=>void, onSave:(t:Trip)=>void}) {
  const [countries, setCountries] = useState<string[]>([''])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const validCountries = countries.filter(Boolean)
    if (!validCountries.length || !startDate || !endDate) return
    setSaving(true)
    const title = validCountries.length === 1 
      ? `${validCountries[0]} — ${format(parseISO(startDate),'d MMM')} to ${format(parseISO(endDate),'d MMM yyyy')}`
      : `${validCountries.join(', ')} — ${format(parseISO(startDate),'d MMM')} to ${format(parseISO(endDate),'d MMM yyyy')}`
    const { data } = await supabase.from('trips').insert({
      title, countries: validCountries, start_date: startDate, end_date: endDate, status:'Draft', notes
    }).select().single()
    setSaving(false)
    if (data) onSave(data)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-in" onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
          <div style={{fontWeight:700, fontSize:17}}>Plan a New Trip</div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer'}}><X size={18}/></button>
        </div>

        <div style={{marginBottom:20}}>
          <label className="form-label">Countries Visiting *</label>
          {countries.map((c,i) => (
            <div key={i} style={{display:'flex',gap:8,marginBottom:8}}>
              <input className="form-input" placeholder={`Country ${i+1}`} value={c} onChange={e=>{
                const n=[...countries]; n[i]=e.target.value; setCountries(n)
              }}/>
              {countries.length>1 && (
                <button onClick={()=>setCountries(prev=>prev.filter((_,j)=>j!==i))} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',flexShrink:0}}><X size={14}/></button>
              )}
            </div>
          ))}
          <button onClick={()=>setCountries(p=>[...p,''])} style={{background:'none',border:'none',color:'var(--sky)',fontSize:12,cursor:'pointer',fontWeight:600, display:'flex', alignItems:'center', gap:4}}>
            <Plus size={12}/> Add another country
          </button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
          <div>
            <label className="form-label">Trip Start Date *</label>
            <input type="date" className="form-input" value={startDate} onChange={e=>setStartDate(e.target.value)}/>
          </div>
          <div>
            <label className="form-label">Trip End Date *</label>
            <input type="date" className="form-input" value={endDate} onChange={e=>setEndDate(e.target.value)}/>
          </div>
        </div>

        <div style={{marginBottom:20}}>
          <label className="form-label">Notes</label>
          <textarea className="form-input" rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Purpose of trip, objectives..." style={{resize:'vertical'}}/>
        </div>

        <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Creating...' : 'Create Trip & Build Itinerary →'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [filter, setFilter] = useState('All')

  useEffect(()=>{loadTrips()},[])
  async function loadTrips() {
    setLoading(true)
    const { data } = await supabase.from('trips').select('*').order('start_date', {ascending:false})
    setTrips(data||[])
    setLoading(false)
  }

  const filtered = trips.filter(t => filter==='All' || t.status===filter)

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{fontWeight:700, fontSize:20, letterSpacing:'-0.02em', display:'flex', alignItems:'center', gap:10}}>
            <Map size={20} style={{color:'var(--warning)'}}/>
            Trip Planner
          </div>
          <div style={{color:'var(--text-muted)', fontSize:13, marginTop:2}}>Plan and manage your international recruitment trips</div>
        </div>
        <button className="btn-primary" onClick={()=>setShowNew(true)}>
          <Plus size={15}/> New Trip
        </button>
      </div>

      <div style={{padding:'20px 28px'}}>
        <div style={{display:'flex', gap:4, marginBottom:24}}>
          {['All','Draft','Approved','In Progress','Completed'].map(s=>(
            <button key={s} onClick={()=>setFilter(s)} style={{
              padding:'6px 14px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', border:'none',
              background: filter===s ? 'var(--sky)' : 'var(--midnight-card)',
              color: filter===s ? 'var(--midnight)' : 'var(--text-muted)',
              transition:'all 0.15s'
            }}>{s}</button>
          ))}
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner" style={{width:24,height:24,border:'2px solid var(--midnight-border)',borderTopColor:'var(--warning)',borderRadius:'50%'}}/></div>
        ) : filtered.length===0 ? (
          <div className="empty-state">
            <Map size={48} className="icon"/>
            <div style={{fontWeight:600,color:'var(--text-secondary)',fontSize:16}}>No trips yet</div>
            <p>Plan your first international recruitment trip.</p>
            <button className="btn-primary" onClick={()=>setShowNew(true)} style={{marginTop:8}}>
              <Plus size={14}/> Plan a Trip
            </button>
          </div>
        ) : (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(360px, 1fr))', gap:16}}>
            {filtered.map(trip=>(
              <Link key={trip.id} href={`/trips/${trip.id}`} style={{textDecoration:'none'}}>
                <div className="card" style={{cursor:'pointer', transition:'all 0.2s'}}
                  onMouseEnter={e=>(e.currentTarget.style.borderColor='var(--sky)')}
                  onMouseLeave={e=>(e.currentTarget.style.borderColor='var(--midnight-border)')}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span className={`badge ${STATUS_COLORS[trip.status]}`} style={{display:'flex',alignItems:'center',gap:4}}>
                        {STATUS_ICONS[trip.status]}{trip.status}
                      </span>
                    </div>
                    <ChevronRight size={16} style={{color:'var(--text-muted)'}}/>
                  </div>
                  <div style={{fontWeight:700,fontSize:15,marginBottom:6,lineHeight:1.4}}>{trip.title}</div>
                  <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                    <span style={{color:'var(--text-muted)',fontSize:12,display:'flex',alignItems:'center',gap:4}}>
                      <Calendar size={11}/>
                      {format(parseISO(trip.start_date),'d MMM')} – {format(parseISO(trip.end_date),'d MMM yyyy')}
                    </span>
                    <span style={{color:'var(--text-muted)',fontSize:12,display:'flex',alignItems:'center',gap:4}}>
                      <Globe size={11}/>{trip.countries.join(', ')}
                    </span>
                  </div>
                  {trip.notes && <div style={{marginTop:10,fontSize:12,color:'var(--text-muted)',lineHeight:1.5,borderTop:'1px solid var(--midnight-border)',paddingTop:10}}>{trip.notes}</div>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showNew && <NewTripModal onClose={()=>setShowNew(false)} onSave={t=>{setTrips(p=>[t,...p]);setShowNew(false)}}/>}
    </div>
  )
}
