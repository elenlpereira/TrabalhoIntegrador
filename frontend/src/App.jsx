import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Estoque from './pages/Estoque'
import Produto from './pages/Produto'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/estoque" element={<Estoque />} />
      <Route path="/estoque/novo" element={<Produto />} />
      <Route path="/estoque/:id" element={<Produto />} />
    </Routes>
  )
}

export default App