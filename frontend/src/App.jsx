import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import RotaProtegida from './components/RotaProtegida'
import Login from './pages/Login'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Estoque from './pages/Estoque'
import Produto from './pages/Produto'
import Consumo from './pages/Consumo'
import NovaComanda from './pages/NovaComanda'
import EditarComanda from './pages/EditarComanda'
import Clientes from './pages/Clientes'
import Cliente from './pages/Cliente'
import Fornecedores from './pages/Fornecedores'
import Fornecedor from './pages/Fornecedor'
import Usuarios from './pages/Usuarios'
import Usuario from './pages/Usuario'
import Logs from './pages/Logs'
import Historico from './pages/Historico'
import Compra from './pages/Compra'
import Pagamento from './pages/Pagamento'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<RotaProtegida><Home /></RotaProtegida>} />
        <Route path="/dashboard" element={<RotaProtegida><Dashboard /></RotaProtegida>} />

        <Route path="/estoque" element={<RotaProtegida><Estoque /></RotaProtegida>} />
        <Route path="/estoque/novo" element={<RotaProtegida><Produto /></RotaProtegida>} />
        <Route path="/estoque/:id" element={<RotaProtegida><Produto /></RotaProtegida>} />

        <Route path="/consumo" element={<RotaProtegida><Consumo /></RotaProtegida>} />
        <Route path="/consumo/nova" element={<RotaProtegida><NovaComanda /></RotaProtegida>} />
        <Route path="/consumo/:id" element={<RotaProtegida><EditarComanda /></RotaProtegida>} />

        <Route path="/clientes" element={<RotaProtegida><Clientes /></RotaProtegida>} />
        <Route path="/clientes/novo" element={<RotaProtegida><Cliente /></RotaProtegida>} />
        <Route path="/clientes/:id" element={<RotaProtegida><Cliente /></RotaProtegida>} />

        <Route path="/fornecedores" element={<RotaProtegida apenasGerente><Fornecedores /></RotaProtegida>} />
        <Route path="/fornecedores/novo" element={<RotaProtegida apenasGerente><Fornecedor /></RotaProtegida>} />
        <Route path="/fornecedores/:id" element={<RotaProtegida apenasGerente><Fornecedor /></RotaProtegida>} />

        <Route path="/usuarios" element={<RotaProtegida apenasGerente><Usuarios /></RotaProtegida>} />
        <Route path="/usuarios/novo" element={<RotaProtegida apenasGerente><Usuario /></RotaProtegida>} />
        <Route path="/usuarios/:id" element={<RotaProtegida apenasGerente><Usuario /></RotaProtegida>} />

        <Route path="/logs" element={<RotaProtegida apenasGerente><Logs /></RotaProtegida>} />
        <Route path="/historico" element={<RotaProtegida><Historico /></RotaProtegida>} />
                                 
        <Route path="/compras/nova" element={<RotaProtegida apenasGerente><Compra /></RotaProtegida>} />

        <Route path="/pagamento/:id" element={<RotaProtegida><Pagamento /></RotaProtegida>} />
      </Routes>
    </AuthProvider>
  )
}

export default App