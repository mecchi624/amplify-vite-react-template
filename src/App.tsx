import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const client = generateClient<Schema>();

function App() {
  // Todoの型を指定
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [entries, setEntries] = useState<Array<Schema["newtable"]["type"]>>([]);

  // Todoを削除する関数
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  // Todoを作成する関数
  function createTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      client.models.Todo.create({ content });
    }
  }

  // newtableにエントリを追加する関数
  async function addNewEntry() {
    const newEntry = await client.models.newtable.create({
      column1: "サンプルデータ",
      id: entries.length + 1 // 自動インクリメント風に id を設定
    });
    console.log(newEntry);
    // 新しいエントリを状態に追加
    setEntries([...entries, newEntry]);
  }

  // useEffectでデータを購読
  useEffect(() => {
    const subscription = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });

    // コンポーネントがアンマウントされたときに購読を解除
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>{user?.signInDetails?.loginId}'s todos</h1>
          <button onClick={createTodo}>+ new</button>
          <ul>
            {todos.map((todo) => (
              <li
                key={todo.id}  // keyの設定
                onClick={() => deleteTodo(todo.id)}
              >
                {todo.content}
              </li>
            ))}
          </ul>
          <div>
            🥳 App successfully hosted. Try creating a new todo.
            <br />
            <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
              Review next step of this tutorial.
            </a>
          </div>
          <button onClick={signOut}>Sign out</button>
          
          <div>
            <button onClick={addNewEntry}>新しいエントリを追加</button>
            <ul>
              {entries.map((entry, index) => (
                <li key={index}>
                  {entry.column1} (ID: {entry.id})
                </li>
              ))}
            </ul>
          </div>
        </main>
      )}
    </Authenticator>
  );
}

export default App;
