import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-white text-lg font-semibold" style={{ background: 'var(--color-sidebar)' }}>
            AL
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">AuditLens</h1>
          <p className="mt-1 text-sm text-neutral-500">CA firm compliance platform</p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
