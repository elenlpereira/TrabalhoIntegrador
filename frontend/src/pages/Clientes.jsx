import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

// id=1 é o Consumidor Final — protegido no backend, ocultamos na lista
const CONSUMIDOR_FINAL_ID = 1

function Clientes() {
    const navigate = useNavigate()
    const [clientes, setClientes] = useState([])
    const [busca, setBusca] = useState('')
    const [erro, setErro] = useState(null)
    const [removendo, setRemovendo] = useState(null)

    useEffect(() => {
        carregarClientes()
    }, [])

    async function carregarClientes() {
        try {
            const res = await api.get('/clientes')
            setClientes(res.data.clientes.filter(c => c.id_cliente !== CONSUMIDOR_FINAL_ID))
        } catch {
            setErro('Erro ao carregar clientes')
        }
    }

    async function remover(id) {
        if (!window.confirm('Deseja remover este cliente?')) return
        setRemovendo(id)
        try {
            await api.delete(`/clientes/${id}`)
            setClientes(prev => prev.filter(c => c.id_cliente !== id))
        } catch (e) {
            setErro(e.response?.data?.erro || 'Erro ao remover cliente')
        } finally {
            setRemovendo(null)
        }
    }

    const clientesFiltrados = clientes.filter(c =>
        c.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (c.cpf || '').includes(busca)
    )

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <span style={styles.logo}>Bar Pereira</span>
                <div style={styles.headerRight}>
                    <button style={styles.btnVoltar} onClick={() => navigate('/')}>Voltar</button>
                    <button style={styles.btnSair}>Sair</button>
                </div>
            </header>

            <div style={styles.body}>
                <aside style={styles.sidebar}>
                    <button style={styles.btnNovo} onClick={() => navigate('/clientes/novo')}>
                        Novo cliente
                    </button>
                </aside>

                <main style={styles.main}>
                    <p style={styles.tituloSecao}>Pesquisar clientes</p>
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
                                <th style={styles.th}>Cliente</th>
                                <th style={styles.th}>CPF</th>
                                <th style={styles.th}>Telefone</th>
                                <th style={styles.th}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientesFiltrados.map(c => (
                                <tr key={c.id_cliente}>
                                    <td style={styles.td}>{c.nome}</td>
                                    <td style={styles.td}>{formatarCpf(c.cpf)}</td>
                                    <td style={styles.td}>{c.telefone || '—'}</td>
                                    <td style={styles.td}>
                                        <button
                                            style={styles.btnAcao}
                                            onClick={() => navigate(`/clientes/${c.id_cliente}`)}
                                            title="Editar"
                                        >✏️</button>
                                        <button
                                            style={styles.btnAcao}
                                            onClick={() => remover(c.id_cliente)}
                                            disabled={removendo === c.id_cliente}
                                            title="Remover"
                                        >🗑️</button>
                                    </td>
                                </tr>
                            ))}
                            {clientesFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ ...styles.td, color: '#888', textAlign: 'center' }}>
                                        Nenhum cliente encontrado
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

function formatarCpf(cpf) {
    if (!cpf) return '—'
    const s = cpf.replace(/\D/g, '')
    if (s.length !== 11) return cpf
    return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-${s.slice(9)}`
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
    btnNovo: { backgroundColor: '#2d6a4f', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' },
    main: { flex: 1, padding: '24px' },
    tituloSecao: { fontWeight: '500', marginBottom: '8px' },
    buscaRow: { marginBottom: '16px' },
    input: { width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' },
    erroMsg: { color: '#e53935', fontSize: '14px', marginBottom: '12px' },
    tabela: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #ddd', fontSize: '13px', color: '#555' },
    td: { padding: '10px 12px', borderBottom: '1px solid #eee', fontSize: '14px' },
    btnAcao: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
}

export default Clientes
