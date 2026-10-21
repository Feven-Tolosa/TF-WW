'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { api, setToken, getToken } from '@/lib/api'

export default function AdminLogin() {
  const router = useRouter()

  // Already signed in? Go straight to the dashboard
  useEffect(() => {
    if (getToken()) router.replace('/admin/dashboard')
  }, [router])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await api<{ token: string; name: string }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }
      )
      setToken(data.token)
      router.push('/admin/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-stone-100 px-4'>
      <form
        onSubmit={handleSubmit}
        className='admin-card w-full max-w-sm p-8'
      >
        <h1 className='mb-1 text-2xl font-light tracking-tight text-stone-900'>
          TF Wood Works
        </h1>
        <p className='mb-7 text-xs font-medium uppercase tracking-[0.3em] text-wood-700'>
          Admin Login
        </p>

        {error && (
          <p className='mb-4 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-600'>
            {error}
          </p>
        )}

        <div className='mb-4'>
          <label className='admin-label'>Email</label>
          <input
            type='email'
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='admin@example.com'
            className='admin-input'
          />
        </div>

        <div className='mb-6'>
          <label className='admin-label'>Password</label>
          <div className='relative'>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='••••••••'
              className='admin-input pr-11'
            />
            <button
              type='button'
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className='absolute inset-y-0 right-0 flex w-11 items-center justify-center text-stone-400 transition-colors hover:text-stone-700 focus:outline-none'
            >
              {showPassword ? (
                <EyeOff className='h-4.5 w-4.5' />
              ) : (
                <Eye className='h-4.5 w-4.5' />
              )}
            </button>
          </div>
        </div>

        <button type='submit' disabled={loading} className='admin-btn w-full'>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}