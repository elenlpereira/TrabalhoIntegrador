import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Estoque from './pages/Estoque'
import Produto from './pages/Produto'
import Consumo from './pages/Consumo'
import NovaComanda from './pages/NovaComanda'
import EditarComanda from './pages/EditarComanda'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/estoque" element={<Estoque />} />
      <Route path="/estoque/novo" element={<Produto />} />
      <Route path="/estoque/:id" element={<Produto />} />
      <Route path="/consumo" element={<Consumo />} />
      <Route path="/consumo/nova" element={<NovaComanda />} />
      <Route path="/consumo/:id" element={<EditarComanda />} />
    </Routes>
  )
}

export default App