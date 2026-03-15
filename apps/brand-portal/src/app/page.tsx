import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect root to the dashboard. If not logged in, middleware will push to /login.
  redirect('/dashboard')
}
