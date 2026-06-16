import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Todos (Supabase Test)</h1>
      {todos && todos.length > 0 ? (
        <ul className="space-y-2 list-disc pl-5">
          {todos.map((todo) => (
            <li key={todo.id} className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              {todo.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500">No todos found or error connecting to Supabase.</p>
      )}
    </div>
  )
}
