import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 items-center pt-20">
      <div className="w-full max-w-4xl px-4 flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Brand Dashboard</h1>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 flex flex-col gap-4 shadow-sm">
          <h2 className="text-xl font-semibold">Welcome back!</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            You are logged in into the FashionDiscovery Brand Portal as: <span className="font-medium text-black dark:text-white">{user.email}</span>
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            This dashboard is under construction. Soon, you will be able to upload product catalogs, launch validation experiments, and view demand intelligence reports here.
          </p>
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
             <form action="/auth/signout" method="post">
                <button className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" type="submit">
                  Sign out
                </button>
             </form>
          </div>
        </div>
      </div>
    </div>
  )
}
