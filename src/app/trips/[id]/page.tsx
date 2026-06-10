'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import type { Trip, TripDay, Activity, Agent, Branch, School } from '@/lib/supabase'
import { 
  ArrowLeft, Plus, Calendar, Plane, Building2, GraduationCap, 
  Users, Coffee, MoreHorizontal, X, Clock, MapPin, DollarSign,
  Train, Car, Bus, ChevronDown, ChevronUp, Edit2, Trash2,
  FileText, Sparkles, CheckSquare, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { format, parseISO, addDays } from 'date-fns'

const TRANSPORT_MODES = ['Air','Train','Taxi','Bus','Private Car','Ferry','Other']
const REST_TYPES = ['TOIL','Weekend','Bank Holiday','Personal Day']

const ACTIVITY_TYPES = [
  { key:'travel', label:'Travel', icon: Plane, color:'#38bdf8' },
  { key:'agent_visit', label:'Agent Visit', icon: Users, color:'#a78bfa' },
  { key:'school_visit', label:'School Visit', icon: GraduationCap, color:'#34d399' },
  { key:'recruitment_event', label:'Recruitment Event', icon: Building2, color:'#fbbf24' },
  { key:'rest', label:'Resting Day', icon: Coffee, color:'#94a3b8' },
  { key:'other', label:'Other', icon: MoreHorizontal, color:'#64748b' },
]

function ActivityIcon({type, size=14}: {type: string, size?: number}) {
  const t = ACTIVITY_TYPES.find(a=>a.key===type)
  if (!t) return null
  const Icon = t.icon
  return <Icon size={size} style={{color: t.color}}/>
}

function ActivityModal({day, activity, agents, branches, schools, onClose, onSave}: {
  day: TripDay, activity: Activity|null, agents: Agent[], branches: Branch[], schools: School[],
  onClose: ()=>void, onSave: (a:Activity)=>void
}) {
  const blank: Partial<Activity> = {
    trip_day_id: day.id, type:'travel', time_from:'09:00', time_to:'', sort_order:0,
    transport_mode:'Air', title:'', description:'', notes:'', cost: undefined,
    departure_time:'', arrival_time:'', arrival_date:'', airline:'', flight_number:'',
    venue_name:'', venue_address:''
  }
  const [form, setForm] = useState<Partial<Activity>>(activity || blank)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      if (activity?.id) {
        const { data } = await supabase.from('activities').update(form).eq('id', activity.id).select().single()
        if (data) onSave(data)
      } else {
        const { data } = await supabase.from('activities').insert(form).select().single()
        if (data) onSave(data)
      }
    } finally { setSaving(false) }
  }

  const type = form.type || 'travel'
  const t = ACTIVITY_TYPES.find(a=>a.key===type)

  const Field = ({k, label, placeholder='', type='text', half=false}: {k: keyof Activity, label: string, placeholder?: string, type?: string, half?: boolean}) => (
    <div style={{marginBottom:14, gridColumn: half ? 'auto' : '1/-1'}}>
      <label className="form-label">{label}</label>
      <input className="form-input" type={type} placeholder={placeholder}
        value={(form[k] as string|number) ?? ''} onChange={e=>setForm({...form, [k]: e.target.value})}/>
    </div>
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-in" style={{maxWidth:700}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <div style={{fontWeight:700, fontSize:17, display:'flex', alignItems:'center', gap:8}}>
            {t && <t.icon size={16} style={{color: t.color}}/>}
            {activity ? 'Edit Activity' : 'Add Activity'}
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer'}}><X size={18}/></button>
        </div>

        {/* Activity type selector */}
        {!activity && (
          <div style={{marginBottom:20}}>
            <label className="form-label">Activity Type *</label>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8}}>
              {ACTIVITY_TYPES.map(at=>(
                <button key={at.key} onClick={()=>setForm({...form, type: at.key as Activity['type']})} style={{
                  padding:'10px 12px', borderRadius:8, cursor:'pointer', border:'1px solid',
                  borderColor: form.type===at.key ? at.color : 'var(--midnight-border)',
                  background: form.type===at.key ? `rgba(${at.color==='#38bdf8'?'56,189,248':at.color==='#a78bfa'?'167,139,250':at.color==='#34d399'?'52,211,153':at.color==='#fbbf24'?'251,191,36':'148,163,184'},0.1)` : 'var(--midnight)',
                  color: form.type===at.key ? at.color : 'var(--text-secondary)',
                  display:'flex', alignItems:'center', gap:6, fontWeight:600, fontSize:12,
                  transition:'all 0.15s'
                }}>
                  <at.icon size={14}/>{at.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px'}}>
          {/* Time */}
          {type !== 'rest' && (
            <>
              <div style={{marginBottom:14}}>
                <label className="form-label">Time From</label>
                <input type="time" className="form-input" value={form.time_from||''} onChange={e=>setForm({...form,time_from:e.target.value})}/>
              </div>
              <div style={{marginBottom:14}}>
                <label className="form-label">Time To</label>
                <input type="time" className="form-input" value={form.time_to||''} onChange={e=>setForm({...form,time_to:e.target.value})}/>
              </div>
            </>
          )}

          {/* TRAVEL */}
          {type==='travel' && (
            <>
              <div style={{marginBottom:14, gridColumn:'1/-1'}}>
                <label className="form-label">Mode of Transport</label>
                <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                  {TRANSPORT_MODES.map(m=>(
                    <button key={m} onClick={()=>setForm({...form,transport_mode:m})} style={{
                      padding:'5px 12px', borderRadius:16, fontSize:12, cursor:'pointer', border:'1px solid',
                      borderColor: form.transport_mode===m ? 'var(--sky)' : 'var(--midnight-border)',
                      background: form.transport_mode===m ? 'rgba(56,189,248,0.1)' : 'transparent',
                      color: form.transport_mode===m ? 'var(--sky)' : 'var(--text-muted)',
                      fontWeight:600, transition:'all 0.1s'
                    }}>{m}</button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:14}}>
                <label className="form-label">Departure Time</label>
                <input type="time" className="form-input" value={form.departure_time||''} onChange={e=>setForm({...form,departure_time:e.target.value})}/>
              </div>
              <div style={{marginBottom:14}}>
                <label className="form-label">Arrival Time</label>
                <input type="time" className="form-input" value={form.arrival_time||''} onChange={e=>setForm({...form,arrival_time:e.target.value})}/>
              </div>
              <div style={{marginBottom:14}}>
                <label className="form-label">Arrival Date</label>
                <input type="date" className="form-input" value={form.arrival_date||''} onChange={e=>setForm({...form,arrival_date:e.target.value})}/>
              </div>
              <div style={{marginBottom:14}}>
                <label className="form-label">Cost (£)</label>
                <input type="number" className="form-input" placeholder="0.00" value={form.cost||''} onChange={e=>setForm({...form,cost:parseFloat(e.target.value)||undefined})}/>
              </div>
              <div style={{marginBottom:14}}>
                <label className="form-label">Airline / Carrier</label>
                <input className="form-input" placeholder="e.g. British Airways" value={form.airline||''} onChange={e=>setForm({...form,airline:e.target.value})}/>
              </div>
              <div style={{marginBottom:14}}>
                <label className="form-label">Flight / Reference No.</label>
                <input className="form-input" placeholder="e.g. BA247" value={form.flight_number||''} onChange={e=>setForm({...form,flight_number:e.target.value})}/>
              </div>
            </>
          )}

          {/* AGENT VISIT */}
          {type==='agent_visit' && (
            <>
              <div style={{marginBottom:14, gridColumn:'1/-1'}}>
                <label className="form-label">Agent Branch *</label>
                <select className="form-select" value={form.agent_branch_id||''} onChange={e=>setForm({...form,agent_branch_id:e.target.value})}>
                  <option value="">Select a branch...</option>
                  {branches.map(b=>{
                    const agent = agents.find(a=>a.id===b.agent_id)
                    return <option key={b.id} value={b.id}>{agent?.name} — {b.city}, {b.country}{b.is_main?' (Main)':''}</option>
                  })}
                </select>
                {branches.length===0 && <p style={{fontSize:11,color:'var(--warning)',marginTop:6}}>No branches found. Add branches to agents first.</p>}
              </div>
            </>
          )}

          {/* SCHOOL VISIT */}
          {type==='school_visit' && (
            <>
              <div style={{marginBottom:14, gridColumn:'1/-1'}}>
                <label className="form-label">School *</label>
                <select className="form-select" value={form.school_id||''} onChange={e=>setForm({...form,school_id:e.target.value})}>
                  <option value="">Select a school...</option>
                  {schools.map(s=><option key={s.id} value={s.id}>{s.name} — {s.city}, {s.country}</option>)}
                </select>
              </div>
              <div style={{marginBottom:14, gridColumn:'1/-1'}}>
                <label className="form-label">Linked Agent</label>
                <select className="form-select" value={form.agent_id||''} onChange={e=>setForm({...form,agent_id:e.target.value||undefined})}>
                  <option value="">No linked agent</option>
                  {agents.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div style={{marginBottom:14}}>
                <label className="form-label">Cost (£)</label>
                <input type="number" className="form-input" placeholder="0.00" value={form.cost||''} onChange={e=>setForm({...form,cost:parseFloat(e.target.value)||undefined})}/>
              </div>
            </>
          )}

          {/* RECRUITMENT EVENT */}
          {type==='recruitment_event' && (
            <>
              <div style={{marginBottom:14, gridColumn:'1/-1'}}>
                <label className="form-label">Venue Name *</label>
                <input className="form-input" placeholder="e.g. Lagos Sheraton Hotel" value={form.venue_name||''} onChange={e=>setForm({...form,venue_name:e.target.value})}/>
              </div>
              <div style={{marginBottom:14, gridColumn:'1/-1'}}>
                <label className="form-label">Venue Address</label>
                <input className="form-input" placeholder="Full address" value={form.venue_address||''} onChange={e=>setForm({...form,venue_address:e.target.value})}/>
              </div>
              <div style={{marginBottom:14, gridColumn:'1/-1'}}>
                <label className="form-label">Linked Agent</label>
                <select className="form-select" value={form.agent_id||''} onChange={e=>setForm({...form,agent_id:e.target.value||undefined})}>
                  <option value="">No linked agent</option>
                  {agents.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div style={{marginBottom:14}}>
                <label className="form-label">Cost (£)</label>
                <input type="number" className="form-input" placeholder="0.00" value={form.cost||''} onChange={e=>setForm({...form,cost:parseFloat(e.target.value)||undefined})}/>
              </div>
            </>
          )}

          {/* REST */}
          {type==='rest' && (
            <div style={{marginBottom:14, gridColumn:'1/-1'}}>
              <label className="form-label">Rest Type</label>
              <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                {REST_TYPES.map(r=>(
                  <button key={r} onClick={()=>setForm({...form,rest_type:r})} style={{
                    padding:'5px 12px', borderRadius:16, fontSize:12, cursor:'pointer', border:'1px solid',
                    borderColor: form.rest_type===r ? '#94a3b8' : 'var(--midnight-border)',
                    background: form.rest_type===r ? 'rgba(148,163,184,0.1)' : 'transparent',
                    color: form.rest_type===r ? '#94a3b8' : 'var(--text-muted)',
                    fontWeight:600
                  }}>{r}</button>
                ))}
              </div>
            </div>
          )}

          {/* OTHER */}
          {type==='other' && (
            <>
              <div style={{marginBottom:14, gridColumn:'1/-1'}}>
                <label className="form-label">Title *</label>
                <input className="form-input" placeholder="e.g. British Council Meeting" value={form.title||''} onChange={e=>setForm({...form,title:e.target.value})}/>
              </div>
              <div style={{marginBottom:14, gridColumn:'1/-1'}}>
                <label className="form-label">Location / Venue</label>
                <input className="form-input" placeholder="Address or venue name" value={form.venue_name||''} onChange={e=>setForm({...form,venue_name:e.target.value})}/>
              </div>
              <div style={{marginBottom:14, gridColumn:'1/-1'}}>
                <label className="form-label">Linked Agent</label>
                <select className="form-select" value={form.agent_id||''} onChange={e=>setForm({...form,agent_id:e.target.value||undefined})}>
                  <option value="">No linked agent</option>
                  {agents.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div style={{marginBottom:14, gridColumn:'1/-1'}}>
                <label className="form-label">Linked School</label>
                <select className="form-select" value={form.school_id||''} onChange={e=>setForm({...form,school_id:e.target.value||undefined})}>
                  <option value="">No linked school</option>
                  {schools.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{marginBottom:14}}>
                <label className="form-label">Cost (£)</label>
                <input type="number" className="form-input" placeholder="0.00" value={form.cost||''} onChange={e=>setForm({...form,cost:parseFloat(e.target.value)||undefined})}/>
              </div>
              <div style={{marginBottom:14, gridColumn:'1/-1'}}>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} style={{resize:'vertical'}}/>
              </div>
            </>
          )}

          {/* Notes always last */}
          <div style={{marginBottom:14, gridColumn:'1/-1'}}>
            <label className="form-label">Notes / Comments</label>
            <textarea className="form-input" rows={3} value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} 
              placeholder="These notes will be used for the AI trip report..." style={{resize:'vertical'}}/>
          </div>
        </div>

        <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:8}}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving...': activity ? 'Save Changes':'Add Activity'}</button>
        </div>
      </div>
    </div>
  )
}

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [trip, setTrip] = useState<Trip|null>(null)
  const [days, setDays] = useState<TripDay[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<TripDay|null>(null)
  const [editActivity, setEditActivity] = useState<Activity|null>(null)
  const [addingToDay, setAddingToDay] = useState<TripDay|null>(null)
  const [collapsed, setCollapsed] = useState<Record<string,boolean>>({})
  const [generatingReport, setGeneratingReport] = useState(false)
  const [report, setReport] = useState<string|null>(null)

  useEffect(()=>{ loadAll() }, [id])

  async function loadAll() {
    setLoading(true)
    const [tripRes, daysRes, activitiesRes, agentsRes, branchesRes, schoolsRes] = await Promise.all([
      supabase.from('trips').select('*').eq('id', id).single(),
      supabase.from('trip_days').select('*').eq('trip_id', id).order('day_number'),
      supabase.from('activities').select('*').eq('trip_day_id', '').limit(0), // placeholder
      supabase.from('agents').select('*').order('name'),
      supabase.from('branches').select('*'),
      supabase.from('schools').select('*').order('name'),
    ])
    setTrip(tripRes.data)
    setDays(daysRes.data||[])
    setAgents(agentsRes.data||[])
    setBranches(branchesRes.data||[])
    setSchools(schoolsRes.data||[])
    
    if (daysRes.data?.length) {
      const dayIds = daysRes.data.map((d:TripDay) => d.id)
      const { data: acts } = await supabase.from('activities').select('*').in('trip_day_id', dayIds).order('sort_order')
      setActivities(acts||[])
    }
    setLoading(false)
  }

  async function addDay() {
    if (!trip) return
    const nextNum = days.length + 1
    const date = format(addDays(parseISO(trip.start_date), nextNum - 1), 'yyyy-MM-dd')
    const { data } = await supabase.from('trip_days').insert({trip_id: id, date, day_number: nextNum}).select().single()
    if (data) setDays(p=>[...p, data])
  }

  async function deleteActivity(actId: string) {
    await supabase.from('activities').delete().eq('id', actId)
    setActivities(p => p.filter(a => a.id !== actId))
  }

  async function generateReport() {
    setGeneratingReport(true)
    const tripSummary = JSON.stringify({ trip, days, activities, agents, schools, branches }, null, 2).substring(0, 6000)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are an international recruitment officer assistant. Generate a professional trip report from this data:\n\n${tripSummary}\n\nWrite a structured trip report including: executive summary, day-by-day highlights, agent meetings summary, school visits summary, recruitment events summary, key outcomes and follow-up actions. Use professional UK university tone. Format with clear headings.`
          }]
        })
      })
      const data = await res.json()
      setReport(data.content?.[0]?.text || 'No report generated')
    } catch { setReport('Error generating report. Please try again.') }
    setGeneratingReport(false)
  }

  if (loading) return <div className="empty-state" style={{marginTop:100}}><div className="spinner" style={{width:28,height:28,border:'2px solid var(--midnight-border)',borderTopColor:'var(--sky)',borderRadius:'50%'}}/></div>
  if (!trip) return <div className="empty-state" style={{marginTop:100}}><AlertCircle size={36} className="icon"/><div>Trip not found</div></div>

  const dayActivities = (dayId: string) => activities.filter(a => a.trip_day_id === dayId).sort((a,b)=>a.sort_order-b.sort_order)
  const getAgent = (id?: string) => agents.find(a=>a.id===id)
  const getBranch = (id?: string) => branches.find(b=>b.id===id)
  const getSchool = (id?: string) => schools.find(s=>s.id===id)

  function activityLabel(a: Activity) {
    if (a.type==='travel') return `${a.transport_mode} ${a.departure_time||''} → ${a.arrival_time||''}`.trim()
    if (a.type==='agent_visit') { const b=getBranch(a.agent_branch_id); const ag=getAgent(b?.agent_id); return ag ? `${ag.name}${b?' ('+b.city+')':''}` : 'Agent Visit' }
    if (a.type==='school_visit') { const s=getSchool(a.school_id); return s ? s.name : 'School Visit' }
    if (a.type==='recruitment_event') return a.venue_name || 'Recruitment Event'
    if (a.type==='rest') return a.rest_type || 'Rest Day'
    return a.title || 'Other'
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <Link href="/trips" style={{color:'var(--text-muted)',display:'flex',alignItems:'center',gap:4,textDecoration:'none',fontSize:13}}>
            <ArrowLeft size={14}/> Trips
          </Link>
          <div style={{width:1, height:16, background:'var(--midnight-border)'}}/>
          <div>
            <div style={{fontWeight:700, fontSize:16}}>{trip.title}</div>
            <div style={{color:'var(--text-muted)', fontSize:12, marginTop:1}}>
              {format(parseISO(trip.start_date), 'd MMM')} – {format(parseISO(trip.end_date), 'd MMM yyyy')} · {trip.countries.join(', ')}
            </div>
          </div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn-ghost" onClick={addDay}><Plus size={14}/> Add Day</button>
          <button className="btn-primary" onClick={generateReport} disabled={generatingReport}>
            <Sparkles size={14}/>{generatingReport ? 'Generating...' : 'AI Report'}
          </button>
        </div>
      </div>

      <div style={{padding:'24px 28px'}}>
        {/* AI Report */}
        {report && (
          <div className="card" style={{marginBottom:24, borderColor:'rgba(167,139,250,0.3)'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14}}>
              <div style={{fontWeight:700, display:'flex', alignItems:'center', gap:8}}><Sparkles size={15} style={{color:'#a78bfa'}}/> AI Trip Report</div>
              <button onClick={()=>setReport(null)} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer'}}><X size={14}/></button>
            </div>
            <div style={{whiteSpace:'pre-wrap', fontSize:13, lineHeight:1.8, color:'var(--text-secondary)'}}>{report}</div>
          </div>
        )}

        {days.length === 0 ? (
          <div className="empty-state">
            <Calendar size={40} className="icon"/>
            <div style={{fontWeight:600, color:'var(--text-secondary)'}}>No days added yet</div>
            <p>Start building your itinerary by adding days to this trip.</p>
            <button className="btn-primary" onClick={addDay} style={{marginTop:8}}><Plus size={14}/> Add Day 1</button>
          </div>
        ) : days.map(day => {
          const acts = dayActivities(day.id)
          const isCollapsed = collapsed[day.id]
          return (
            <div key={day.id} style={{marginBottom:16}}>
              {/* Day header */}
              <div className="day-header">
                <div style={{
                  width:36, height:36, borderRadius:8, background:'var(--sky)', 
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontWeight:700, fontSize:13, color:'var(--midnight)', flexShrink:0
                }}>
                  D{day.day_number}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700, fontSize:14}}>Day {day.day_number}</div>
                  <div style={{color:'var(--text-muted)', fontSize:12}}>
                    {format(parseISO(day.date), 'EEEE d MMMM yyyy')}
                  </div>
                </div>
                <div style={{display:'flex', gap:8, alignItems:'center'}}>
                  <button className="btn-ghost" style={{padding:'5px 10px', fontSize:12}} onClick={()=>setAddingToDay(day)}>
                    <Plus size={12}/> Activity
                  </button>
                  <button onClick={()=>setCollapsed(p=>({...p,[day.id]:!p[day.id]}))} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer'}}>
                    {isCollapsed ? <ChevronDown size={16}/> : <ChevronUp size={16}/>}
                  </button>
                </div>
              </div>

              {!isCollapsed && (
                <div style={{paddingLeft:8}}>
                  {acts.length === 0 ? (
                    <div style={{padding:'20px 0', color:'var(--text-muted)', fontSize:12, textAlign:'center', border:'1px dashed var(--midnight-border)', borderRadius:8, marginBottom:8}}>
                      No activities yet — <button onClick={()=>setAddingToDay(day)} style={{background:'none',border:'none',color:'var(--sky)',cursor:'pointer',fontSize:12,fontWeight:600}}>add one</button>
                    </div>
                  ) : acts.map(act => {
                    const t = ACTIVITY_TYPES.find(a=>a.key===act.type)
                    return (
                      <div key={act.id} className="activity-card">
                        <div className="activity-stripe" style={{background: t?.color || 'var(--text-muted)'}}/>
                        <div style={{paddingLeft:10, display:'flex', alignItems:'center', gap:12}}>
                          <div style={{flex:1}}>
                            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
                              <ActivityIcon type={act.type}/>
                              <span style={{fontWeight:600, fontSize:13}}>{activityLabel(act)}</span>
                              {act.time_from && (
                                <span style={{color:'var(--text-muted)', fontSize:11, display:'flex', alignItems:'center', gap:3}}>
                                  <Clock size={10}/>{act.time_from}{act.time_to ? ` – ${act.time_to}` : ''}
                                </span>
                              )}
                              {act.cost && <span style={{fontSize:11, color:'var(--warning)', display:'flex', alignItems:'center', gap:3}}><DollarSign size={10}/>£{act.cost}</span>}
                            </div>
                            {act.notes && <div style={{fontSize:11, color:'var(--text-muted)', paddingLeft:22, lineHeight:1.5}}>{act.notes}</div>}
                          </div>
                          <div style={{display:'flex', gap:4}}>
                            <button onClick={()=>setEditActivity(act)} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',padding:4,borderRadius:4,transition:'color 0.1s'}}><Edit2 size={13}/></button>
                            <button onClick={()=>deleteActivity(act.id)} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',padding:4,borderRadius:4,transition:'color 0.1s'}}><Trash2 size={13}/></button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {(addingToDay || editActivity) && (
        <ActivityModal
          day={addingToDay || days.find(d=>d.id === editActivity?.trip_day_id)!}
          activity={editActivity}
          agents={agents} branches={branches} schools={schools}
          onClose={()=>{ setAddingToDay(null); setEditActivity(null) }}
          onSave={a=>{
            if (editActivity) setActivities(p=>p.map(x=>x.id===a.id?a:x))
            else setActivities(p=>[...p, a])
            setAddingToDay(null); setEditActivity(null)
          }}
        />
      )}
    </div>
  )
}
