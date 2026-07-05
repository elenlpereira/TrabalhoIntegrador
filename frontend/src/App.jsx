import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Estoque from './pages/Estoque'
import Produto from './pages/Produto'
import Clientes from './pages/Clientes'
import Cliente from './pages/Cliente'
import Fornecedores from './pages/Fornecedores'
import Fornecedor from './pages/Fornecedor'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/estoque" element={<Estoque />} />
      <Route path="/estoque/novo" element={<Produto />} />
      <Route path="/estoque/:id" element={<Produto />} />
      <Route path="/clientes" element={<Clientes />} />
      <Route path="/clientes/novo" element={<Cliente />} />
      <Route path="/clientes/:id" element={<Cliente />} />
      <Route path="/fornecedores" element={<Fornecedores />} />
      <Route path="/fornecedores/novo" element={<Fornecedor />} />
      <Route path="/fornecedores/:id" element={<Fornecedor />} />
    </Routes>
  )
}

export default App