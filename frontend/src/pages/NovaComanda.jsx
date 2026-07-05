import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function NovaComanda() {
    const navigate = useNavigate()
    const [identificacao, setIdentificacao] = useState('')
    const [erro, setErro] = useState(null)
    const [salvando, setSalvando] = useState(false)

    async function handleConfirmar() {
        if (!identificacao.trim()) {
            setErro('Informe a identificação da comanda')
            return
        }
        setErro(null)
        setSalvando(true)
        try {
            const res = await api.post('/comandas', { identificacao: identificacao.trim() })
            navigate(`/consumo/${res.data.id_comanda}`)
        } catch (e) {
            setErro(e.response?.data?.erro || 'Erro ao criar comanda')
        } finally {
            setSalvando(false)
        }
    }

    return (
        <div style={s.container}>
            <div style={s.topbar}>
                <span style={s.tbName}>Bar Pereira</span>
                <span style={s.tbSpacer} />
                <button style={s.pillVoltar} onClick={() => navigate('/consumo')}>VOLTAR</button>
                <button style={s.pillSair}>SAIR</button>
            </div>

            <div style={s.breadcrumb}>
                <span style={s.logoChip}>logo</span>
                <span style={s.crumb} onClick={() => navigate('/consumo')}>Consumo</span>
                <span style={s.crumbActive}>Nova comanda</span>
            </div>

            <div style={s.body}>
                <main style={s.main}>
                    <div style={s.card}>
                        <h2 style={s.titulo}>Nova comanda</h2>
                        <p style={s.descricao}>
                            Informe a identificação da comanda. Pode ser o número da mesa ou um nome informal (ex: "Mesa 3", "João").
                        </p>

                        <div style={s.campo}>
                            <label style={s.label}>Identificação</label>
                            <input
                                style={s.input}
                                placeholder='Ex: Mesa 3, João, Sinuca...'
                                value={identificacao}
                                onChange={e => setIdentificacao(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleConfirmar()}
                                autoFocus
                            />
                        </div>

                        {erro && <p style={s.erro}>{erro}</p>}

                        <div style={s.acoes}>
                            <button style={s.btnCancelar} onClick={() => navigate('/consumo')}>
                                CANCELAR
                            </button>
                            <button
                                style={{ ...s.btn, ...s.btnSolid }}
                                onClick={handleConfirmar}
                                disabled={salvando}
                            >
                                {salvando ? 'ABRINDO...' : 'ABRIR COMANDA'}
                            </button>
                        </div>
                    </div>
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
    crumb: { color: '#777', cursor: 'pointer' },
    crumbActive: { color: '#222', fontWeight: 700 },
    body: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
    main: { width: '100%', maxWidth: 480 },
    card: { background: '#fff', border: '1px solid #e4e4e4', borderRadius: 8, padding: 32 },
    titulo: { margin: '0 0 8px', fontSize: 18, color: '#222' },
    descricao: { margin: '0 0 24px', fontSize: 13, color: '#777', lineHeight: 1.5 },
    campo: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 },
    label: { fontSize: 13, fontWeight: 600, color: '#333' },
    input: { border: '1px solid #ccc', borderRadius: 5, padding: '10px 12px', fontSize: 14, background: '#fafafa', outline: 'none' },
    erro: { color: '#e6453c', fontSize: 13, marginBottom: 12 },
    acoes: { display: 'flex', justifyContent: 'flex-end', gap: 12 },
    btnCancelar: { padding: '9px 24px', borderRadius: 16, fontWeight: 700, fontSize: 12, cursor: 'pointer', border: '1.5px solid #ccc', background: '#fff', color: '#555' },
    btn: { display: 'inline-block', padding: '9px 24px', borderRadius: 16, fontWeight: 700, fontSize: 12, cursor: 'pointer', border: '1.5px solid #3aa65b', background: '#fff', color: '#3aa65b' },
    btnSolid: { background: '#3aa65b', color: '#fff' },
    footer: { padding: '8px 20px', textAlign: 'right', fontSize: 12 },
    footerLink: { color: '#2f6fed', textDecoration: 'none' },
}

export default NovaComanda