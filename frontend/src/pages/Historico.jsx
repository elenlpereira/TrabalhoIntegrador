import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'

const STATUS_CORES = {
    fechada:    { bg: '#e8f5e9', color: '#2d6a4f' },
    'a receber': { bg: '#fff3e0', color: '#e65100' },
    cancelada:  { bg: '#ffebee', color: '#c62828' },
}

function formatarData(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function Historico() {
    const navigate = useNavigate()
    const [comandas, setComandas] = useState([])
    const [busca, setBusca] = useState('')
    const [statusFiltro, setStatusFiltro] = useState('todas')
    const [erro, setErro] = useState(null)
    const [carregando, setCarregando] = useState(false)

    useEffect(() => {
        carregarHistorico()
    }, [statusFiltro])

    async function carregarHistorico() {
        setCarregando(true)
        try {
            const params = {}
            if (statusFiltro !== 'todas') params.status = statusFiltro
            const res = await api.get('/comandas', { params })
            // Exclui comandas abertas
            setComandas(res.data.comandas.filter(c => c.status !== 'aberta'))
        } catch {
            setErro('Erro ao carregar histórico')
        } finally {
            setCarregando(false)
        }
    }

    const comandasFiltradas = comandas.filter(c => {
        const id = String(c.id_comanda)
        const ident = (c.identificacao || '').toLowerCase()
        const forma = (c.forma_pagamento || '').toLowerCase()
        const q = busca.toLowerCase()
        return !busca || id.includes(q) || ident.includes(q) || forma.includes(q)
    })

    return (
        <div style={s.container}>
            <Header voltarPara="/" />

            <main style={s.main}>
                <div style={s.topRow}>
                    <h2 style={s.titulo}>Histórico de Comandas</h2>
                    <button style={s.btnAtivo} onClick={() => navigate('/consumo')}>
                        Ver comandas ativas →
                    </button>
                </div>

                <div style={s.filtros}>
                    <input
                        style={s.input}
                        placeholder="Pesquise por #id, nome ou forma de pagamento"
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                    />
                    <div style={s.statusBotoes}>
                        {['todas', 'fechada', 'a receber', 'cancelada'].map(st => (
                            <button
                                key={st}
                                style={{ ...s.statusBtn, ...(statusFiltro === st ? s.statusBtnAtivo : {}) }}
                                onClick={() => setStatusFiltro(st)}
                            >
                                {st.charAt(0).toUpperCase() + st.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {erro && <p style={s.erro}>{erro}</p>}

                <div style={s.resumo}>
                    {carregando ? 'Carregando...' : `${comandasFiltradas.length} comanda(s)`}
                </div>

                <table style={s.tabela}>
                    <thead>
                        <tr>
                            <th style={s.th}>#</th>
                            <th style={s.th}>Identificação</th>
                            <th style={s.th}>Status</th>
                            <th style={s.th}>Pagamento</th>
                            <th style={s.th}>Abertura</th>
                            <th style={s.th}>Fechamento</th>
                            <th style={s.th}>Total</th>
                            <th style={s.th}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {comandasFiltradas.map(c => {
                            const cor = STATUS_CORES[c.status] || { bg: '#f5f5f5', color: '#555' }
                            return (
                                <tr key={c.id_comanda}>
                                    <td style={s.td}>#{c.id_comanda}</td>
                                    <td style={s.td}>{c.identificacao || '—'}</td>
                                    <td style={s.td}>
                                        <span style={{ ...s.badge, backgroundColor: cor.bg, color: cor.color }}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td style={s.td}>{c.forma_pagamento || '—'}</td>
                                    <td style={s.tdMono}>{formatarData(c.data_hora_inicio)}</td>
                                    <td style={s.tdMono}>{formatarData(c.data_hora_termino)}</td>
                                    <td style={{ ...s.td, fontWeight: '600' }}>
                                        R$ {Number(c.valor_total || 0).toFixed(2)}
                                    </td>
                                    <td style={s.td}>
                                        <button
                                            style={s.btnVer}
                                            onClick={() => navigate(`/consumo/${c.id_comanda}`, { state: { from: '/historico' } })}
                                        >
                                            Ver
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                        {comandasFiltradas.length === 0 && !carregando && (
                            <tr>
                                <td colSpan={8} style={{ ...s.td, textAlign: 'center', color: '#888' }}>
                                    Nenhuma comanda encontrada
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </main>
        </div>
    )
}

const s = {
    container: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    main: { flex: 1, padding: '24px' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    titulo: { fontSize: '18px', fontWeight: '600', color: '#333', margin: 0 },
    btnAtivo: { backgroundColor: '#fff', border: '1px solid #2d6a4f', color: '#2d6a4f', padding: '7px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
    filtros: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'center' },
    input: { flex: '1 1 260px', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' },
    statusBotoes: { display: 'flex', gap: '6px' },
    statusBtn: { backgroundColor: '#fff', border: '1px solid #ddd', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    statusBtnAtivo: { backgroundColor: '#2d6a4f', color: '#fff', borderColor: '#2d6a4f' },
    erro: { color: '#e53935', fontSize: '13px', marginBottom: '8px' },
    resumo: { fontSize: '12px', color: '#888', marginBottom: '8px' },
    tabela: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #ddd', fontSize: '12px', color: '#555', whiteSpace: 'nowrap' },
    td: { padding: '9px 12px', borderBottom: '1px solid #eee', fontSize: '13px' },
    tdMono: { padding: '9px 12px', borderBottom: '1px solid #eee', fontSize: '12px', color: '#666', whiteSpace: 'nowrap' },
    badge: { fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: '500' },
    btnVer: { background: 'none', border: '1px solid #ddd', padding: '3px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
}

export default Historico
