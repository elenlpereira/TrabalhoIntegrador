import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import RotaProtegida from './components/RotaProtegida'
import Login from './pages/Login'
import Home from './pages/Home'
import Estoque from './pages/Estoque'
import Produto from './pages/Produto'
import Clientes from './pages/Clientes'
import Cliente from './pages/Cliente'
import Fornecedores from './pages/Fornecedores'
import Fornecedor from './pages/Fornecedor'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<RotaProtegida><Home /></RotaProtegida>} />

        <Route path="/estoque" element={<RotaProtegida><Estoque /></RotaProtegida>} />
        <Route path="/estoque/novo" element={<RotaProtegida><Produto /></RotaProtegida>} />
        <Route path="/estoque/:id" element={<RotaProtegida><Produto /></RotaProtegida>} />

        <Route path="/clientes" element={<RotaProtegida><Clientes /></RotaProtegida>} />
        <Route path="/clientes/novo" element={<RotaProtegida><Cliente /></RotaProtegida>} />
        <Route path="/clientes/:id" element={<RotaProtegida><Cliente /></RotaProtegida>} />

        <Route path="/fornecedores" element={<RotaProtegida apenasGerente><Fornecedores /></RotaProtegida>} />
        <Route path="/fornecedores/novo" element={<RotaProtegida apenasGerente><Fornecedor /></RotaProtegida>} />
        <Route path="/fornecedores/:id" element={<RotaProtegida apenasGerente><Fornecedor /></RotaProtegida>} />
      </Routes>
    </AuthProvider>
  )
}

export default App