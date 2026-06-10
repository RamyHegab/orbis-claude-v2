'use client'
import { Map, Users, GraduationCap, TrendingUp, ArrowRight, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  return (
    <div style={{padding:'32px'}}>
      {/* Header */}
      <div style={{marginBottom:32}}>
        <div style={{fontSize:24, fontWeight:700, color:'var(--text-primary)', letterSpacing:'-0.03em', marginBottom:6}}>
          Good morning 👋
        </div>
        <div style={{color:'var(--text-secondary)', fontSize:14}}>
          Here's what's happening with your international operations.
        </div>
      </div>

      {/* Quick access cards */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, marginBottom:32}}>
        {[
          { href:'/agents', icon: Users, label:'Agents', desc:'Manage agent relationships & branches', color:'#38bdf8' },
          { href:'/schools', icon: GraduationCap, label:'Schools', desc:'Your partner schools worldwide', color:'#34d399' },
          { href:'/trips', icon: Map, label:'Plan a Trip', desc:'Build itineraries with AI reporting', color:'#fbbf24' },
        ].map(({href, icon: Icon, label, desc, color}) => (
          <Link key={href} href={href} style={{textDecoration:'none'}}>
            <div className="card" style={{cursor:'pointer', transition:'all 0.2s', borderColor:'transparent'}}
              onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--midnight-border)')}>
              <div style={{
                width:40, height:40, borderRadius:10, marginBottom:14,
                background:`rgba(${color === '#38bdf8' ? '56,189,248' : color === '#34d399' ? '52,211,153' : '251,191,36'},0.15)`,
                display:'flex', alignItems:'center', justifyContent:'center'
              }}>
                <Icon size={18} style={{color}}/>
              </div>
              <div style={{fontWeight:600, fontSize:15, marginBottom:4}}>{label}</div>
              <div style={{color:'var(--text-muted)', fontSize:12}}>{desc}</div>
              <div style={{marginTop:12, display:'flex', alignItems:'center', gap:4, color, fontSize:12, fontWeight:600}}>
                Open <ArrowRight size={12}/>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent trips + stats */}
      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16}}>
        <div className="card">
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16}}>
            <div style={{fontWeight:600, display:'flex', alignItems:'center', gap:8}}>
              <Calendar size={16} style={{color:'var(--sky)'}}/>
              Recent Trips
            </div>
            <Link href="/trips" style={{color:'var(--sky)', fontSize:12, textDecoration:'none', fontWeight:600}}>View all →</Link>
          </div>
          <div className="empty-state">
            <Map size={36} className="icon"/>
            <div style={{fontWeight:600, color:'var(--text-secondary)'}}>No trips yet</div>
            <p>Plan your first international trip to get started.</p>
            <Link href="/trips/new">
              <button className="btn-primary" style={{marginTop:8}}>Plan a Trip</button>
            </Link>
          </div>
        </div>

        <div className="card">
          <div style={{fontWeight:600, marginBottom:16, display:'flex', alignItems:'center', gap:8}}>
            <TrendingUp size={16} style={{color:'var(--sky)'}}/>
            Quick Stats
          </div>
          {[
            { label:'Total Agents', value:'—', color:'var(--sky)' },
            { label:'Schools', value:'—', color:'var(--success)' },
            { label:'Trips This Year', value:'0', color:'var(--warning)' },
            { label:'Leads Captured', value:'0', color:'#a78bfa' },
          ].map(({label, value, color}) => (
            <div key={label} style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'10px 0', borderBottom:'1px solid var(--midnight-border)'
            }}>
              <div style={{fontSize:13, color:'var(--text-secondary)'}}>{label}</div>
              <div style={{fontWeight:700, fontSize:16, color}}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
