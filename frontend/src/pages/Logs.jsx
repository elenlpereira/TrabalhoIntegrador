import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'

// Tipos de log conhecidos para o filtro
const TIPOS = [
    'login',
    'registrar_compra', 'estornar_compra',
    'fechar_comanda', 'cancelar_comanda',
    'adicionar_consumo', 'remover_consumo', 'editar_consumo',
    'cadastrar_cliente', 'editar_cliente', 'remover_cliente',
    'cadastrar_fornecedor', 'editar_fornecedor', 'remover_fornecedor',
    'cadastrar_produto', 'editar_produto', 'remover_produto',
    'cadastrar_usuario', 'editar_usuario', 'remover_usuario',
]

function formatarDataHora(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

// Data local no formato YYYY-MM-DD (evita virar dia seguinte em UTC)
function hojeLocal() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function Logs() {
    const navigate = useNavigate()
    const [logs, setLogs] = useState([])
    const [erro, setErro] = useState(null)
    const [carregando, setCarregando] = useState(false)

    const hoje = hojeLocal()
    const [filtros, setFiltros] = useState({
        data_inicio: hoje,
        data_fim:    hoje,
        tipos:       [],
    })
    const [buscaTipo, setBuscaTipo] = useState('')
    const tiposFiltrados = TIPOS.filter(t => t.includes(buscaTipo.toLowerCase()))

    useEffect(() => {
        carregarLogs()
    }, [])

    async function carregarLogs(params = null) {
        setCarregando(true)
        setErro(null)
        try {
            const p = params ?? {
                ...(filtros.data_inicio            && { data_inicio: filtros.data_inicio }),
                ...(filtros.data_fim               && { data_fim:    filtros.data_fim }),
                ...(filtros.tipos.length > 0       && { tipo: filtros.tipos.join(',') }),
            }
            const res = await api.get('/logs', { params: p })
            setLogs(res.data.logs)
        } catch {
            setErro('Erro ao carregar logs')
        } finally {
            setCarregando(false)
        }
    }

    function handleFiltroChange(e) {
        setFiltros({ ...filtros, [e.target.name]: e.target.value })
    }

    function handleTipoToggle(tipo) {
        setFiltros(prev => ({
            ...prev,
            tipos: prev.tipos.includes(tipo)
                ? prev.tipos.filter(t => t !== tipo)
                : [...prev.tipos, tipo],
        }))
    }

    function handleBuscar(e) {
        e.preventDefault()
        carregarLogs()
    }

    function limparFiltros() {
        const reset = { data_inicio: hoje, data_fim: hoje, tipos: [] }
        setFiltros(reset)
        setBuscaTipo('')
        carregarLogs({ data_inicio: reset.data_inicio, data_fim: reset.data_fim })
    }

    return (
        <div style={styles.container}>
            <Header voltarPara="/" />

            <main style={styles.main}>
                <h2 style={styles.titulo}>Auditoria</h2>

                <form style={styles.filtros} onSubmit={handleBuscar}>
                    <div style={styles.filtroGrupo}>
                        <label style={styles.label}>Data início</label>
                        <input
                            style={styles.inputFiltro}
                            type="date"
                            name="data_inicio"
                            value={filtros.data_inicio}
                            onChange={handleFiltroChange}
                        />
                    </div>
                    <div style={styles.filtroGrupo}>
                        <label style={styles.label}>Data fim</label>
                        <input
                            style={styles.inputFiltro}
                            type="date"
                            name="data_fim"
                            value={filtros.data_fim}
                            onChange={handleFiltroChange}
                        />
                    </div>
                    <div style={styles.filtroGrupo}>
                        <label style={styles.label}>Tipo de ação</label>
                        <input
                            style={{ ...styles.inputFiltro, marginBottom: 6, width: '100%', boxSizing: 'border-box' }}
                            placeholder="Buscar tipo..."
                            value={buscaTipo}
                            onChange={e => setBuscaTipo(e.target.value)}
                        />
                        <div style={styles.checkboxGrid}>
                            {tiposFiltrados.length === 0 && (
                                <span style={{ fontSize: 12, color: '#888' }}>Nenhum tipo encontrado</span>
                            )}
                            {tiposFiltrados.map(t => (
                                <label key={t} style={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={filtros.tipos.includes(t)}
                                        onChange={() => handleTipoToggle(t)}
                                        style={{ marginRight: 5 }}
                                    />
                                    {t}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div style={styles.filtroAcoes}>
                        <button type="submit" style={styles.btnBuscar} disabled={carregando}>
                            {carregando ? 'Buscando...' : 'Buscar'}
                        </button>
                        <button type="button" style={styles.btnLimpar} onClick={limparFiltros}>
                            Limpar
                        </button>
                    </div>
                </form>

                {erro && <p style={styles.erroMsg}>{erro}</p>}

                <div style={styles.resumo}>
                    {logs.length} registro{logs.length !== 1 ? 's' : ''} encontrado{logs.length !== 1 ? 's' : ''}
                </div>

                <table style={styles.tabela}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Data / Hora</th>
                            <th style={styles.th}>Usuário</th>
                            <th style={styles.th}>Perfil</th>
                            <th style={styles.th}>Tipo</th>
                            <th style={styles.th}>Descrição</th>
                            <th style={styles.th}>Comanda</th>
                            <th style={styles.th}>Compra</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id_log} style={styles.tr}>
                                <td style={styles.tdMono}>{formatarDataHora(log.data_hora)}</td>
                                <td style={styles.td}>{log.Usuario?.nome || `#${log.fk_usuario}`}</td>
                                <td style={styles.td}>
                                    {log.Usuario?.perfil_acesso && (
                                        <span style={log.Usuario.perfil_acesso === 'Gerente' ? styles.badgeGerente : styles.badgeAtendente}>
                                            {log.Usuario.perfil_acesso}
                                        </span>
                                    )}
                                </td>
                                <td style={styles.td}>
                                    <span style={styles.tipo}>{log.tipo}</span>
                                </td>
                                <td style={{ ...styles.td, maxWidth: '300px' }}>{log.descricao || '—'}</td>
                                <td style={styles.td}>
                                    {log.fk_comanda
                                        ? <button style={styles.link} onClick={() => navigate(`/consumo/${log.fk_comanda}`, { state: { from: '/logs' } })}>#{log.fk_comanda}</button>
                                        : '—'}
                                </td>
                                <td style={styles.td}>{log.fk_compra ? `#${log.fk_compra}` : '—'}</td>
                            </tr>
                        ))}
                        {logs.length === 0 && !carregando && (
                            <tr>
                                <td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#888' }}>
                                    Nenhum log encontrado para o período selecionado
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </main>
        </div>
    )
}

const styles = {
    container: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    main: { flex: 1, padding: '24px' },
    titulo: { fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#333' },
    filtros: { display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap', backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '16px' },
    filtroGrupo: { display: 'flex', flexDirection: 'column', gap: '4px' },
    label: { fontSize: '12px', fontWeight: '500', color: '#555' },
    inputFiltro: { padding: '7px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' },
    checkboxGrid: { display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' },
    checkboxLabel: { display: 'flex', alignItems: 'center', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' },
    filtroAcoes: { display: 'flex', gap: '8px', alignItems: 'flex-end', paddingTop: '16px' },
    btnBuscar: { backgroundColor: '#2d6a4f', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
    btnLimpar: { backgroundColor: '#fff', border: '1px solid #ddd', padding: '7px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
    erroMsg: { color: '#e53935', fontSize: '14px', marginBottom: '12px' },
    resumo: { fontSize: '13px', color: '#888', marginBottom: '8px' },
    tabela: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #ddd', fontSize: '12px', color: '#555', whiteSpace: 'nowrap' },
    tr: { borderBottom: '1px solid #eee' },
    td: { padding: '9px 12px', fontSize: '13px', verticalAlign: 'top' },
    tdMono: { padding: '9px 12px', fontSize: '13px', whiteSpace: 'nowrap', color: '#555' },
    tipo: { backgroundColor: '#f0f4ff', color: '#1a237e', fontSize: '11px', padding: '2px 7px', borderRadius: '10px', fontFamily: 'monospace' },
    badgeGerente:   { backgroundColor: '#1a237e', color: '#fff', fontSize: '11px', padding: '2px 7px', borderRadius: '10px' },
    badgeAtendente: { backgroundColor: '#e8f5e9', color: '#2d6a4f', fontSize: '11px', padding: '2px 7px', borderRadius: '10px' },
    link: { background: 'none', border: 'none', color: '#2d6a4f', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px', padding: 0 },
}

export default Logs
