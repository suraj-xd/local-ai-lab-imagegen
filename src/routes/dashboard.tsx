import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
  ssr: true,
})

function Dashboard() {
  // Since we removed authentication and database, redirect to home
  return <Navigate to="/" />
}