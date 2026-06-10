'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Globe, Users, GraduationCap, Map, 
  FileText, LayoutDashboard, ChevronRight, Settings
} from 'lucide-react'

const nav = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/agents', icon: Users, label: 'Agents' },
  { href: '/schools', icon: GraduationCap, label: 'Schools' },
  { href: '/trips', icon: Map, label: 'Trip Planner' },
  { href: '/forms', icon: FileText, label: 'Forms' },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{padding: '24px 20px 16px', borderBottom: '1px solid var(--midnight-border)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{
            width:34, height:34, background:'var(--sky)', borderRadius:8,
            display:'flex', alignItems:'center', justifyContent:'center'
          }}>
            <Globe size={18} color="var(--midnight)" strokeWidth={2.5}/>
          </div>
          <div>
            <div style={{fontWeight:700, fontSize:15, color:'var(--text-primary)', letterSpacing:'-0.02em'}}>Orbis</div>
            <div style={{fontSize:10, color:'var(--sky)', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase'}}>International</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:2}}>
        {nav.map(({href, icon: Icon, label}) => {
          const active = path === href || (href !== '/' && path.startsWith(href))
          return (
            <Link key={href} href={href} style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'9px 12px', borderRadius:8,
              color: active ? 'var(--text-primary)' : 'var(--text-muted)',
              background: active ? 'var(--midnight-card)' : 'transparent',
              textDecoration:'none', fontSize:13, fontWeight: active ? 600 : 400,
              transition:'all 0.15s', position:'relative'
            }}>
              <Icon size={16} style={{color: active ? 'var(--sky)' : 'inherit'}}/>
              {label}
              {active && <ChevronRight size={12} style={{marginLeft:'auto', color:'var(--sky)', opacity:0.6}}/>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{padding:'12px 10px', borderTop:'1px solid var(--midnight-border)'}}>
        <Link href="/settings" style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'9px 12px', borderRadius:8,
          color:'var(--text-muted)', textDecoration:'none', fontSize:13,
          transition:'all 0.15s'
        }}>
          <Settings size={16}/>
          Settings
        </Link>
      </div>
    </aside>
  )
}
