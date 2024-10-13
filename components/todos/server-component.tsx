import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Server-side action for adding a todo
export async function addTodo(formData: FormData) {
  'use server';
  const supabase = createClient();
  const title = formData.get('title')?.toString() || '';
  const priority = formData.get('priority')?.toString() || '1';

  if (title.trim()) {
    const { error } = await supabase.from('todos').insert([
      { title, priority: parseInt(priority), updated_at: new Date().toISOString(), deleted: false }
    ]);
    if (error) {
      throw new Error('Failed to add todo: ' + error.message);
    }
    revalidatePath('/todos');
  }
}

// Server-side action for editing a todo
export async function editTodo(formData: FormData) {
  'use server';
  const supabase = createClient();
  const id = formData.get('id')?.toString() || '';
  const title = formData.get('title')?.toString() || '';
  const priority = formData.get('priority')?.toString() || '1';

  if (id && title.trim()) {
    const { error } = await supabase
      .from('todos')
      .update({ title, priority: parseInt(priority), updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      throw new Error('Failed to update todo: ' + error.message);
    }
    revalidatePath('/todos');
  }
}

// Server-side action for soft-deleting a todo
export async function deleteTodo(formData: FormData) {
  'use server';
  const supabase = createClient();
  const id = formData.get('id')?.toString() || '';

  if (id) {
    const { error } = await supabase
      .from('todos')
      .update({ deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      throw new Error('Failed to delete todo: ' + error.message);
    }
    revalidatePath('/todos');
  }
}

export default async function ServerTodoComponent() {
  const supabase = createClient();

  // Fetch existing todos that are not deleted
  const { data: todos, error } = await supabase
    .from('todos')
    .select('*')
    .eq('deleted', false);

  if (error) {
    return <h1>Error fetching todos: {error.message}</h1>;
  }

  if (!todos || todos.length === 0) return <h1>No todos found.</h1>;

  return (
    <>
      <main className='flex-1 flex flex-col gap-6 px-4'>
        <h1 className="text-2xl mb-4">Server-Side Todos</h1>

        {/* List existing todos */}
        {todos.map(todo => (
          <div key={todo.id} className="mb-4">
            <form action={editTodo} className="flex flex-col">
              <input type="hidden" name="id" value={todo.id} />
              <input
                type="text"
                name="title"
                defaultValue={todo.title}
                placeholder="Edit title"
                required
                className="border p-2 mb-2 w-full"
              />
              <select name="priority" defaultValue={todo.priority} className="border p-2 mb-2 w-full">
                <option value="1">1 (Low)</option>
                <option value="2">2 (Medium)</option>
                <option value="3">3 (High)</option>
              </select>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
                Update
              </button>
            </form>
            <form action={deleteTodo} className="mt-2">
              <input type="hidden" name="id" value={todo.id} />
              <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded w-full">
                Delete
              </button>
            </form>
            <p>Last updated: {new Date(todo.updated_at).toLocaleString()}</p>
          </div>
        ))}

        {/* Form to add a new todo - stacked vertically */}
        <form action={addTodo} className="flex flex-col mt-6">
          <input type='text' name='title' placeholder='Enter new todo title' required className="border p-2 mb-2 w-full" />
          <select name='priority' defaultValue='1' className="border p-2 mb-2 w-full">
            <option value='1'>1 (Low)</option>
            <option value='2'>2 (Medium)</option>
            <option value='3'>3 (High)</option>
          </select>
          <button type='submit' className="bg-green-500 text-white px-4 py-2 rounded w-full">
            Add Todo
          </button>
        </form>
      </main>
    </>
  );
}