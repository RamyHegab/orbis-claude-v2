'use client'
import { Settings, Database, Palette, Users, Globe } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{fontWeight:700,fontSize:20,letterSpacing:'-0.02em',display:'flex',alignItems:'center',gap:10}}>
            <Settings size={20} style={{color:'var(--sky)'}}/>Settings
          </div>
          <div style={{color:'var(--text-muted)',fontSize:13,marginTop:2}}>Configure your Orbis instance</div>
        </div>
      </div>
      <div style={{padding:'24px 28px',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:16}}>
        {[
          {icon:Database,color:'var(--sky)',title:'Database Connection',desc:'Manage your Supabase connection and view sync status.',action:'Configure'},
          {icon:Users,color:'#a78bfa',title:'Account Managers',desc:'Add and manage account managers who can be assigned to agents.',action:'Manage'},
          {icon:Globe,color:'var(--success)',title:'University Profile',desc:'Set your university name, logo, and branding.',action:'Edit'},
          {icon:Palette,color:'var(--warning)',title:'Appearance',desc:'Customise colours and layout preferences.',action:'Customise'},
        ].map(({icon:Icon,color,title,desc,action})=>(
          <div key={title} className="card">
            <div style={{width:40,height:40,borderRadius:8,background:`rgba(${color==='var(--sky)'?'56,189,248':color==='#a78bfa'?'167,139,250':color==='var(--success)'?'52,211,153':'251,191,36'},0.1)`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>
              <Icon size={18} style={{color}}/>
            </div>
            <div style={{fontWeight:600,marginBottom:6}}>{title}</div>
            <div style={{color:'var(--text-muted)',fontSize:12,lineHeight:1.6,marginBottom:14}}>{desc}</div>
            <button className="btn-ghost" style={{fontSize:12,padding:'6px 12px'}}>{action}</button>
          </div>
        ))}
      </div>
    </div>
  )
}
