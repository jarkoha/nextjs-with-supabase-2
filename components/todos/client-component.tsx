'use client';

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientTodoComponent() {
  const [todos, setTodos] = useState<any[] | null>([]);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  // Fetch todos on mount
  const fetchTodos = async () => {
    const { data, error } = await supabase.from('todos').select().eq('deleted', false);
    if (error) {
      setError(error.message);
    } else {
      setTodos(data);
    }
  };

  useEffect(() => {
    fetchTodos(); // Fetch todos on component mount
  }, []);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form reload
    const formData = new FormData(e.target as HTMLFormElement);
    const title = formData.get('title')?.toString();
    const priority = Number(formData.get('priority'));

    if (!title || !title.trim()) return; // Prevent empty todo

    const { error } = await supabase
      .from('todos')
      .insert([{ title, priority, updated_at: new Date().toISOString(), deleted: false }]);
    if (error) {
      setError(error.message);
    } else {
      router.refresh(); // Refresh the page to reload todos from both components
    }
  };

  const updateTodo = async (id: number, title: string, priority: number) => {
    if (!title.trim()) return; // Prevent empty update

    const { error } = await supabase
      .from('todos')
      .update({ title, priority, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      setError(error.message);
    } else {
      router.refresh(); // Refresh the page to reload todos from both components
    }
  };

  const deleteTodo = async (id: number) => {
    const { error } = await supabase
      .from('todos')
      .update({ deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      setError(error.message);
    } else {
      router.refresh(); // Refresh the page to reload todos from both components
    }
  };

  if (error) {
    return <pre>Error: {error}</pre>;
  }

  return (
    <div>
      <h1 className="text-2xl mb-4">Client-Side Todos</h1>

      {/* Display todos with edit and delete options */}
      {todos?.map(todo => (
        <div key={todo.id} className="mb-4">
          <input
            type="text"
            defaultValue={todo.title}
            onBlur={(e) => updateTodo(todo.id, e.target.value, todo.priority)}
            placeholder="Edit title"
            className="border p-2 mb-2 w-full"
          />
          <select
            defaultValue={todo.priority}
            onChange={(e) => updateTodo(todo.id, todo.title, Number(e.target.value))}
            className="border p-2 mb-2 w-full"
          >
            <option value="1">1 (Low)</option>
            <option value="2">2 (Medium)</option>
            <option value="3">3 (High)</option>
          </select>
          <button onClick={() => updateTodo(todo.id, todo.title, todo.priority)} className="bg-blue-500 text-white px-4 py-2 rounded">
            Update
          </button>
          <button onClick={() => deleteTodo(todo.id)} className="bg-red-500 text-white px-4 py-2 rounded ml-2">
            Delete
          </button>
          <p>Last updated: {new Date(todo.updated_at).toLocaleString()}</p>
        </div>
      ))}

      {/* Form to add new todo - stacked vertically */}
      <form onSubmit={addTodo} className="flex flex-col mt-6">
        <input
          type="text"
          name="title"
          placeholder="Enter todo title"
          required
          className="border p-2 mb-2 w-full"
        />
        <select name="priority" defaultValue="1" className="border p-2 mb-2 w-full">
          <option value="1">1 (Low)</option>
          <option value="2">2 (Medium)</option>
          <option value="3">3 (High)</option>
        </select>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded w-full">
          Add Todo
        </button>
      </form>
    </div>
  );
}
