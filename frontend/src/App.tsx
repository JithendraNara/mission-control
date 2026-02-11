import { useState } from 'react'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Mission Control</h1>
      <p>Frontend placeholder - implementation in progress</p>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
      <p>API available at http://localhost:3000</p>
    </>
  )
}

export default App
