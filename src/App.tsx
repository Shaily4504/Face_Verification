import './App.css'
import Check from './Components/Check'

export default function App() {
  // 🔧 Directly define your backend API base here
  const apiBase = 'http://127.0.0.1:4000';

  return (
    <div className="min-h-screen text-gray-900 p-8">
      <h1 className="text-3xl font-bold">Bus Student Attendance</h1>
      <Check apiBase={apiBase} />
    </div>
  );
}
