'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { FileText, Plus, X, Trash2, GripVertical, QrCode, Eye, Edit2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Form, FormField } from '@/lib/supabase'

const FIELD_TYPES = ['text','email','phone','select','textarea','number','date']
const ACTIVITY_TYPES = ['Agent Visit','School Visit','Recruitment Event','Other']

function FormBuilder({ form, onClose, onSave }: { form: Form|null, onClose:()=>void, onSave:(f:Form)=>void }) {
  const [title, setTitle] = useState(form?.title||'')
  const [activityType, setActivityType] = useState(form?.activity_type||'Recruitment Event')
  const [fields, setFields] = useState<FormField[]>(form?.fields||[])
  const [saving, setSaving] = useState(false)

  function addField() {
    const f: FormField = {
      id: Date.now().toString(),
      label: '', type: 'text', required: false, options: []
    }
    setFields(p=>[...p, f])
  }

  function updateField(id: string, updates: Partial<FormField>) {
    setFields(p=>p.map(f=>f.id===id?{...f,...updates}:f))
  }

  async function handleSave() {
    if (!title || !fields.length) return
    setSaving(true)
    const payload = { title, activity_type: activityType, fields }
    try {
      if (form?.id) {
        const { data } = await supabase.from('forms').update(payload).eq('id', form.id).select().single()
        if (data) onSave(data)
      } else {
        const { data } = await supabase.from('forms').insert(payload).select().single()
        if (data) onSave(data)
      }
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-in" style={{maxWidth:720, maxHeight:'90vh'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <div style={{fontWeight:700, fontSize:17}}>{form ? 'Edit Form' : 'Create Form'}</div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer'}}><X size={18}/></button>
        </div>

        <div style={{marginBottom:16}}>
          <label className="form-label">Form Title *</label>
          <input className="form-input" placeholder="e.g. Student Enquiry Form" value={title} onChange={e=>setTitle(e.target.value)}/>
        </div>
        <div style={{marginBottom:20}}>
          <label className="form-label">Linked Activity Type</label>
          <select className="form-select" value={activityType} onChange={e=>setActivityType(e.target.value)}>
            {ACTIVITY_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>

        <div style={{marginBottom:16}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
            <label className="form-label" style={{margin:0}}>Form Fields ({fields.length})</label>
            <button className="btn-ghost" style={{padding:'5px 10px', fontSize:12}} onClick={addField}><Plus size={12}/> Add Field</button>
          </div>
          {fields.length===0 ? (
            <div style={{padding:20, textAlign:'center', border:'1px dashed var(--midnight-border)', borderRadius:8, color:'var(--text-muted)', fontSize:12}}>
              No fields yet — add your first field above
            </div>
          ) : fields.map((f,i)=>(
            <div key={f.id} className="card" style={{marginBottom:8, padding:'12px 14px'}}>
              <div style={{display:'grid', gridTemplateColumns:'auto 1fr 1fr auto auto', gap:8, alignItems:'center'}}>
                <GripVertical size={14} style={{color:'var(--text-muted)', cursor:'grab'}}/>
                <input className="form-input" placeholder={`Field label (e.g. Full Name)`} value={f.label} onChange={e=>updateField(f.id,{label:e.target.value})}/>
                <select className="form-select" value={f.type} onChange={e=>updateField(f.id,{type:e.target.value as FormField['type']})}>
                  {FIELD_TYPES.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                </select>
                <label style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',whiteSpace:'nowrap'}}>
                  <input type="checkbox" checked={f.required} onChange={e=>updateField(f.id,{required:e.target.checked})} style={{accentColor:'var(--sky)'}}/>
                  <span style={{fontSize:11, color:'var(--text-muted)'}}>Required</span>
                </label>
                <button onClick={()=>setFields(p=>p.filter(x=>x.id!==f.id))} style={{background:'none',border:'none',color:'var(--danger)',cursor:'pointer'}}><Trash2 size={14}/></button>
              </div>
              {f.type==='select' && (
                <div style={{marginTop:8, paddingLeft:22}}>
                  <input className="form-input" placeholder="Options (comma-separated): e.g. Option A, Option B"
                    value={(f.options||[]).join(', ')} onChange={e=>updateField(f.id,{options:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}/>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{background:'rgba(56,189,248,0.06)', border:'1px solid rgba(56,189,248,0.15)', borderRadius:8, padding:'10px 14px', marginBottom:16, display:'flex', gap:8, alignItems:'flex-start'}}>
          <QrCode size={14} style={{color:'var(--sky)', flexShrink:0, marginTop:1}}/>
          <div style={{fontSize:12, color:'var(--text-secondary)'}}>
            A QR code will be auto-generated for this form. Forms can be filled offline and synced later. 
            The form will be linked to activities matching the selected activity type.
          </div>
        </div>

        <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving...':form?'Save Changes':'Create Form'}</button>
        </div>
      </div>
    </div>
  )
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([])
  const [loading, setLoading] = useState(true)
  const [showBuilder, setShowBuilder] = useState(false)
  const [editForm, setEditForm] = useState<Form|null>(null)

  useEffect(()=>{ loadForms() }, [])
  async function loadForms() {
    setLoading(true)
    const { data } = await supabase.from('forms').select('*').order('created_at', {ascending:false})
    setForms(data||[])
    setLoading(false)
  }

  async function deleteForm(id: string) {
    if (!confirm('Delete this form?')) return
    await supabase.from('forms').delete().eq('id', id)
    setForms(p=>p.filter(f=>f.id!==id))
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{fontWeight:700, fontSize:20, letterSpacing:'-0.02em', display:'flex', alignItems:'center', gap:10}}>
            <FileText size={20} style={{color:'var(--sky)'}}/>
            Forms
          </div>
          <div style={{color:'var(--text-muted)', fontSize:13, marginTop:2}}>
            Admin-managed lead capture forms linked to trip activities
          </div>
        </div>
        <button className="btn-primary" onClick={()=>setShowBuilder(true)}>
          <Plus size={15}/> Create Form
        </button>
      </div>

      <div style={{padding:'24px 28px'}}>
        <div style={{background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:8, padding:'12px 16px', marginBottom:24, display:'flex', gap:8, alignItems:'flex-start'}}>
          <FileText size={14} style={{color:'var(--warning)', flexShrink:0, marginTop:1}}/>
          <div style={{fontSize:12, color:'var(--text-secondary)'}}>
            <strong style={{color:'var(--warning)'}}>Admin only.</strong> Forms created here are used during recruitment events and visits to capture student leads. 
            Each form generates a QR code and links to activity types. Submissions feed into the AI trip report.
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner" style={{width:24,height:24,border:'2px solid var(--midnight-border)',borderTopColor:'var(--sky)',borderRadius:'50%'}}/></div>
        ) : forms.length===0 ? (
          <div className="empty-state">
            <FileText size={48} className="icon"/>
            <div style={{fontWeight:600,color:'var(--text-secondary)',fontSize:16}}>No forms yet</div>
            <p>Create your first lead capture form for recruitment events and visits.</p>
            <button className="btn-primary" onClick={()=>setShowBuilder(true)} style={{marginTop:8}}><Plus size={14}/> Create Form</button>
          </div>
        ) : (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:16}}>
            {forms.map(f=>(
              <div key={f.id} className="card">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12}}>
                  <div style={{width:40,height:40,borderRadius:8,background:'rgba(56,189,248,0.1)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <FileText size={16} style={{color:'var(--sky)'}}/>
                  </div>
                  <div style={{display:'flex', gap:4}}>
                    <button onClick={()=>setEditForm(f)} style={{background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',padding:4}}><Edit2 size={13}/></button>
                    <button onClick={()=>deleteForm(f.id)} style={{background:'none',border:'none',color:'var(--danger)',cursor:'pointer',padding:4}}><Trash2 size={13}/></button>
                  </div>
                </div>
                <div style={{fontWeight:700, marginBottom:4}}>{f.title}</div>
                <div style={{display:'flex', gap:8, marginBottom:12}}>
                  <span className="badge badge-sky">{f.activity_type}</span>
                  <span className="badge badge-muted">{f.fields.length} fields</span>
                </div>
                <div style={{fontSize:11, color:'var(--text-muted)', marginBottom:12}}>
                  Fields: {f.fields.map(x=>x.label).filter(Boolean).join(', ') || 'No fields'}
                </div>
                <div style={{borderTop:'1px solid var(--midnight-border)', paddingTop:10, display:'flex', gap:8}}>
                  <button className="btn-ghost" style={{flex:1, padding:'6px', fontSize:11, justifyContent:'center'}}>
                    <QrCode size={12}/> View QR
                  </button>
                  <button className="btn-ghost" style={{flex:1, padding:'6px', fontSize:11, justifyContent:'center'}}>
                    <Eye size={12}/> Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(showBuilder || editForm) && (
        <FormBuilder 
          form={editForm}
          onClose={()=>{setShowBuilder(false);setEditForm(null)}}
          onSave={f=>{
            if (editForm) setForms(p=>p.map(x=>x.id===f.id?f:x))
            else setForms(p=>[f,...p])
            setShowBuilder(false); setEditForm(null)
          }}
        />
      )}
    </div>
  )
}
