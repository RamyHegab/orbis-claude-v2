'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
export default function NewTrip() {
  const router = useRouter()
  useEffect(()=>router.replace('/trips'), [router])
  return null
}
