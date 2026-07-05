import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'

function Fornecedores() {
    const navigate = useNavigate()
    const [fornecedores, setFornecedores] = useState([])
    const [busca, setBusca] = useState('')
    const [categoria, setCategoria] = useState('Todas')
    const [erro, setErro] = useState(null)
    const [removendo, setRemovendo] = useState(null)

    useEffect(() => {
        carregarFornecedores()
    }, [])

    async function carregarFornecedores() {
        try {
            const res = await api.get('/fornecedores')
            setFornecedores(res.data.fornecedores)
        } catch {
            setErro('Erro ao carregar fornecedores')
        }
    }

    async function remover(id) {
        if (!window.confirm('Deseja remover este fornecedor?')) return
        setRemovendo(id)
        try {
            await api.delete(`/fornecedores/${id}`)
            setFornecedores(prev => prev.filter(f => f.id_fornecedor !== id))
        } catch (e) {
            setErro(e.response?.data?.erro || 'Erro ao remover fornecedor')
        } finally {
            setRemovendo(null)
        }
    }

    const categorias = ['Todas', ...new Set(fornecedores.map(f => f.categoria_produtos).filter(Boolean))]

    const fornecedoresFiltrados = fornecedores.filter(f => {
        const buscaOk = f.razao_social.toLowerCase().includes(busca.toLowerCase()) ||
            (f.cnpj || '').includes(busca.replace(/\D/g, ''))
        const catOk = categoria === 'Todas' || f.categoria_produtos === categoria
        return buscaOk && catOk
    })

    return (
        <div style={styles.container}>
            <Header voltarPara="/" />

            <div style={styles.body}>
                <aside style={styles.sidebar}>
                    <button style={styles.btnNovo} onClick={() => navigate('/fornecedores/novo')}>
                        Novo fornecedor
                    </button>
                    <p style={styles.sidebarTitulo}>CATEGORIAS FORNECIDAS</p>
                    {categorias.map(c => (
                        <button
                            key={c}
                            style={{ ...styles.sidebarItem, fontWeight: categoria === c ? 'bold' : 'normal' }}
                            onClick={() => setCategoria(c)}
                        >
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                        </button>
                    ))}
                    <div style={{ flex: 1 }} />
                    <button style={styles.linkEstoque} onClick={() => navigate('/estoque')}>
                        Ver estoque →
                    </button>
                </aside>

                <main style={styles.main}>
                    <p style={styles.tituloSecao}>Pesquisar fornecedores</p>
                    <div style={styles.buscaRow}>
                        <input
                            style={styles.input}
                            placeholder="Digite aqui"
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                        />
                    </div>

                    {erro && <p style={styles.erroMsg}>{erro}</p>}

                    <table style={styles.tabela}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Razão social</th>
                                <th style={styles.th}>CNPJ</th>
                                <th style={styles.th}>Telefone</th>
                                <th style={styles.th}>Categoria</th>
                                <th style={styles.th}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {fornecedoresFiltrados.map(f => (
                                <tr key={f.id_fornecedor}>
                                    <td style={styles.td}>{f.razao_social}</td>
                                    <td style={styles.td}>{formatarCnpj(f.cnpj)}</td>
                                    <td style={styles.td}>{f.telefone || '—'}</td>
                                    <td style={styles.td}>
                                        {f.categoria_produtos && (
                                            <span style={styles.badge}>
                                                {f.categoria_produtos.charAt(0).toUpperCase() + f.categoria_produtos.slice(1)}
                                            </span>
                                        )}
                                    </td>
                                    <td style={styles.td}>
                                        <button
                                            style={styles.btnAcao}
                                            onClick={() => navigate(`/fornecedores/${f.id_fornecedor}`)}
                                            title="Editar"
                                        >✏️</button>
                                        <button
                                            style={styles.btnAcao}
                                            onClick={() => remover(f.id_fornecedor)}
                                            disabled={removendo === f.id_fornecedor}
                                            title="Remover"
                                        >🗑️</button>
                                    </td>
                                </tr>
                            ))}
                            {fornecedoresFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ ...styles.td, color: '#888', textAlign: 'center' }}>
                                        Nenhum fornecedor encontrado
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

function formatarCnpj(cnpj) {
    if (!cnpj) return '—'
    const s = cnpj.replace(/\D/g, '')
    if (s.length !== 14) return cnpj
    return `${s.slice(0,2)}.${s.slice(2,5)}.${s.slice(5,8)}/${s.slice(8,12)}-${s.slice(12)}`
}

const styles = {
    container: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', backgroundColor: '#fff', borderBottom: '1px solid #ddd' },
    logo: { fontWeight: 'bold', fontSize: '18px' },
    headerRight: { display: 'flex', gap: '8px' },
    btnVoltar: { backgroundColor: '#555', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
    btnSair: { backgroundColor: '#e53935', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
    body: { display: 'flex', flex: 1 },
    sidebar: { width: '160px', backgroundColor: '#fff', borderRight: '1px solid #ddd', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
    btnNovo: { backgroundColor: '#2d6a4f', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', marginBottom: '4px' },
    sidebarTitulo: { fontSize: '11px', color: '#888', marginTop: '8px', marginBottom: '4px' },
    sidebarItem: { background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: '4px 0', fontSize: '14px' },
    linkEstoque: { background: 'none', border: 'none', color: '#2d6a4f', cursor: 'pointer', textAlign: 'left', fontSize: '13px', padding: '4px 0' },
    main: { flex: 1, padding: '24px' },
    tituloSecao: { fontWeight: '500', marginBottom: '8px' },
    buscaRow: { marginBottom: '16px' },
    input: { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' },
    erroMsg: { color: '#e53935', fontSize: '14px', marginBottom: '12px' },
    tabela: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #ddd', fontSize: '13px', color: '#555' },
    td: { padding: '10px 12px', borderBottom: '1px solid #eee', fontSize: '14px' },
    badge: { backgroundColor: '#e8f5e9', color: '#2d6a4f', fontSize: '12px', padding: '2px 8px', borderRadius: '12px', fontWeight: '500' },
    btnAcao: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
}

export default Fornecedores
