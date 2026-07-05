import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Consumo() {
    const navigate = useNavigate()
    const [comandas, setComandas] = useState([])
    const [erro, setErro] = useState(null)

    useEffect(() => {
        carregarComandas()
    }, [])

    async function carregarComandas() {
        try {
            const res = await api.get('/comandas', { params: { status: 'aberta' } })
            setComandas(res.data.comandas)
        } catch {
            setErro('Erro ao carregar comandas')
        }
    }

    function novaComanda() {
        navigate('/consumo/nova')
    }

    return (
        <div style={s.container}>
            <div style={s.topbar}>
                <span style={s.tbName}>Bar Pereira</span>
                <span style={s.tbSpacer} />
                <button style={s.pillVoltar} onClick={() => navigate('/')}>VOLTAR</button>
                <button style={s.pillSair}>SAIR</button>
            </div>

            <div style={s.breadcrumb}>
                <span style={s.logoChip}>logo</span>
                <span style={s.crumbActive}>Consumo</span>
            </div>

            <div style={s.body}>
                <aside style={s.sidebar}>
                    <button style={s.btnSolid} onClick={novaComanda}>Nova comanda</button>
                    <h4 style={s.sidebarTitle}>COMANDAS ATIVAS</h4>
                    <div style={s.comandaList}>
                        {erro && <p style={{ color: 'red', fontSize: 12 }}>{erro}</p>}
                        {comandas.length === 0 && !erro && (
                            <p style={s.muted}>Nenhuma comanda aberta</p>
                        )}
                        {comandas.map(c => (
                            <button
                                key={c.id_comanda}
                                style={s.comandaItem}
                                onClick={() => navigate(`/consumo/${c.id_comanda}`)}
                            >
                                <span>{c.info_cliente || `#${c.id_comanda}`}</span>
                                <span style={s.editIcon}>✎</span>
                            </button>
                        ))}
                    </div>
                </aside>

                <main style={s.main}>
                    <p style={s.muted}>Selecione ou crie uma comanda para começar.</p>
                </main>
            </div>

            <div style={s.footer}><a href="#" style={s.footerLink}>Contate-nos</a></div>
        </div>
    )
}

const s = {
    container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' },
    topbar: { background: '#1f1f1f', color: '#e6e6e6', display: 'flex', alignItems: 'center', gap: 18, padding: '12px 20px', fontSize: 14 },
    tbName: { fontWeight: 700 },
    tbSpacer: { flex: 1 },
    pillVoltar: { padding: '6px 16px', borderRadius: 14, fontSize: 11, fontWeight: 700, background: '#3aa65b', color: '#fff', border: 'none', cursor: 'pointer' },
    pillSair: { padding: '6px 16px', borderRadius: 14, fontSize: 11, fontWeight: 700, background: '#e6453c', color: '#fff', border: 'none', cursor: 'pointer' },
    breadcrumb: { background: '#ececec', borderBottom: '1px solid #d8d8d8', display: 'flex', alignItems: 'center', gap: 16, padding: '9px 20px', fontSize: 13 },
    logoChip: { background: '#cfcfcf', color: '#6b6b6b', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 3 },
    crumbActive: { color: '#222', fontWeight: 700 },
    body: { flex: 1, display: 'flex' },
    sidebar: { width: 190, borderRight: '1px solid #e8e8e8', background: '#fafafa', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 },
    btnSolid: { background: '#3aa65b', color: '#fff', border: 'none', borderRadius: 16, padding: '9px 24px', fontWeight: 700, fontSize: 12, cursor: 'pointer', textAlign: 'center' },
    sidebarTitle: { margin: 0, fontSize: 11, letterSpacing: 0.4, color: '#8a8a8a', textTransform: 'uppercase' },
    comandaList: { display: 'flex', flexDirection: 'column', gap: 6 },
    comandaItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #e6e6e6', borderRadius: 4, padding: '8px 10px', fontSize: 13, cursor: 'pointer', color: '#333', width: '100%', textAlign: 'left' },
    editIcon: { color: '#9a9a9a', fontSize: 13 },
    main: { flex: 1, padding: '22px 26px', display: 'flex', flexDirection: 'column' },
    muted: { color: '#999', fontSize: 12 },
    footer: { padding: '8px 20px', textAlign: 'right', fontSize: 12 },
    footerLink: { color: '#2f6fed', textDecoration: 'none' },
}

export default Consumo