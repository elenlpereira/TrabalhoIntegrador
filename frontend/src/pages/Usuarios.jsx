import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import api from '../services/api'
import { useOrdenacao, Th } from '../hooks/useOrdenacao.jsx'

const BADGE = {
    Gerente:   { backgroundColor: '#1a237e', color: '#fff' },
    Atendente: { backgroundColor: '#e8f5e9', color: '#2d6a4f' },
}

function Usuarios() {
    const navigate = useNavigate()
    const { usuario: eu } = useAuth()
    const [usuarios, setUsuarios] = useState([])
    const [busca, setBusca] = useState('')
    const [erro, setErro] = useState(null)
    const [removendo, setRemovendo] = useState(null)
    const { coluna, direcao, alternar, ordenar } = useOrdenacao()

    useEffect(() => {
        carregarUsuarios()
    }, [])

    async function carregarUsuarios() {
        try {
            const res = await api.get('/usuarios')
            setUsuarios(res.data.usuarios)
        } catch {
            setErro('Erro ao carregar usuários')
        }
    }

    async function remover(id) {
        if (id === eu.id_usuario) {
            return setErro('Não é possível remover o próprio usuário')
        }
        if (!window.confirm('Deseja remover este usuário?')) return
        setRemovendo(id)
        try {
            await api.delete(`/usuarios/${id}`)
            setUsuarios(prev => prev.filter(u => u.id_usuario !== id))
        } catch (e) {
            setErro(e.response?.data?.erro || 'Erro ao remover usuário')
        } finally {
            setRemovendo(null)
        }
    }

    const usuariosFiltrados = ordenar(usuarios.filter(u =>
        u.nome.toLowerCase().includes(busca.toLowerCase()) ||
        u.email.toLowerCase().includes(busca.toLowerCase())
    ))

    return (
        <div style={styles.container}>
            <Header voltarPara="/" />

            <div style={styles.body}>
                <aside style={styles.sidebar}>
                    <button style={styles.btnNovo} onClick={() => navigate('/usuarios/novo')}>
                        Novo usuário
                    </button>
                </aside>

                <main style={styles.main}>
                    <p style={styles.tituloSecao}>Pesquisar usuários</p>
                    <div style={styles.buscaRow}>
                        <input
                            style={styles.input}
                            placeholder="Pesquise por nome ou e-mail"
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                        />
                    </div>

                    {erro && <p style={styles.erroMsg}>{erro}</p>}

                    <table style={styles.tabela}>
                        <thead>
                            <tr>
                                <Th label="Nome"   col="nome"          coluna={coluna} direcao={direcao} onSort={alternar} />
                                <Th label="E-mail" col="email"         coluna={coluna} direcao={direcao} onSort={alternar} />
                                <Th label="Perfil" col="perfil_acesso" coluna={coluna} direcao={direcao} onSort={alternar} />
                                <th style={styles.th}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuariosFiltrados.map(u => (
                                <tr key={u.id_usuario} style={u.id_usuario === eu.id_usuario ? styles.trEu : {}}>
                                    <td style={styles.td}>
                                        {u.nome}
                                        {u.id_usuario === eu.id_usuario && (
                                            <span style={styles.tagEu}>você</span>
                                        )}
                                    </td>
                                    <td style={styles.td}>{u.email}</td>
                                    <td style={styles.td}>
                                        <span style={{ ...styles.badge, ...BADGE[u.perfil_acesso] }}>
                                            {u.perfil_acesso}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <button
                                            style={styles.btnAcao}
                                            onClick={() => navigate(`/usuarios/${u.id_usuario}`)}
                                            title="Editar"
                                        >✏️</button>
                                        <button
                                            style={{ ...styles.btnAcao, opacity: u.id_usuario === eu.id_usuario ? 0.3 : 1 }}
                                            onClick={() => remover(u.id_usuario)}
                                            disabled={removendo === u.id_usuario || u.id_usuario === eu.id_usuario}
                                            title="Remover"
                                        >🗑️</button>
                                    </td>
                                </tr>
                            ))}
                            {usuariosFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ ...styles.td, color: '#888', textAlign: 'center' }}>
                                        Nenhum usuário encontrado
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </main>
            </div>
        </div>
    )
}

const styles = {
    container: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    body: { display: 'flex', flex: 1 },
    sidebar: { width: '160px', backgroundColor: '#fff', borderRight: '1px solid #ddd', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
    btnNovo: { backgroundColor: '#2d6a4f', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' },
    main: { flex: 1, padding: '24px' },
    tituloSecao: { fontWeight: '500', marginBottom: '8px' },
    buscaRow: { marginBottom: '16px' },
    input: { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' },
    erroMsg: { color: '#e53935', fontSize: '14px', marginBottom: '12px' },
    tabela: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #ddd', fontSize: '13px', color: '#555' },
    td: { padding: '10px 12px', borderBottom: '1px solid #eee', fontSize: '14px' },
    trEu: { backgroundColor: '#f9fbe7' },
    badge: { fontSize: '12px', padding: '2px 8px', borderRadius: '12px', fontWeight: '500' },
    tagEu: { marginLeft: '8px', fontSize: '11px', backgroundColor: '#eee', color: '#555', padding: '1px 6px', borderRadius: '10px' },
    btnAcao: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
}

export default Usuarios
