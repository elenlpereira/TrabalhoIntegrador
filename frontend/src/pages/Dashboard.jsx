import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Header from '../components/Header'

const INTERVALO_REFRESH = 30_000 // 30 segundos

function Card({ titulo, valor, sub, cor, onClick }) {
    return (
        <div style={{ ...s.card, borderTop: `4px solid ${cor}`, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
            <p style={s.cardTitulo}>{titulo}</p>
            <p style={{ ...s.cardValor, color: cor }}>{valor ?? '—'}</p>
            {sub && <p style={s.cardSub}>{sub}</p>}
        </div>
    )
}

function Secao({ titulo, children }) {
    return (
        <section style={s.secao}>
            <h3 style={s.secaoTitulo}>{titulo}</h3>
            <div style={s.cardGrid}>{children}</div>
        </section>
    )
}

function Dashboard() {
    const navigate = useNavigate()
    const [dados, setDados] = useState(null)
    const [erro, setErro] = useState(null)
    const [ultimaAtt, setUltimaAtt] = useState(null)

    const carregar = useCallback(async () => {
        try {
            const res = await api.get('/dashboard')
            setDados(res.data)
            setUltimaAtt(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
            setErro(null)
        } catch {
            setErro('Erro ao carregar dados do dashboard')
        }
    }, [])

    useEffect(() => {
        carregar()
        const timer = setInterval(carregar, INTERVALO_REFRESH)
        return () => clearInterval(timer)
    }, [carregar])

    const c = dados?.cadastros
    const e = dados?.estoque
    const o = dados?.operacional
    const a = dados?.auditoria

    return (
        <div style={s.container}>
            <Header voltarPara="/" />

            <main style={s.main}>
                <div style={s.topRow}>
                    <h2 style={s.titulo}>Dashboard</h2>
                    <div style={s.attRow}>
                        {ultimaAtt && <span style={s.attTexto}>Atualizado às {ultimaAtt}</span>}
                        <button style={s.btnRefresh} onClick={carregar}>↻ Atualizar</button>
                    </div>
                </div>

                {erro && <p style={s.erro}>{erro}</p>}

                {!dados && !erro && <p style={s.carregando}>Carregando...</p>}

                {dados && (
                    <>
                        <Secao titulo="Operacional — Hoje">
                            <Card
                                titulo="Comandas abertas"
                                valor={o?.comandas_abertas}
                                sub="em andamento agora"
                                cor="#2d6a4f"
                                onClick={() => navigate('/consumo')}
                            />
                            <Card
                                titulo="Comandas fechadas hoje"
                                valor={o?.comandas_fechadas_hoje}
                                sub="pagas ou na ficha"
                                cor="#1565c0"
                            />
                            <Card
                                titulo="Fichas pendentes"
                                valor={o?.fichas_pendentes}
                                sub="clientes em débito"
                                cor={o?.fichas_pendentes > 0 ? '#c62828' : '#2d6a4f'}
                            />
                            <Card
                                titulo="Ações registradas hoje"
                                valor={a?.acoes_hoje}
                                sub="logs de auditoria"
                                cor="#6a1b9a"
                                onClick={() => navigate('/logs')}
                            />
                        </Secao>

                        <Secao titulo="Estoque">
                            <Card
                                titulo="Total de produtos"
                                valor={c?.produtos}
                                sub="cadastrados"
                                cor="#37474f"
                                onClick={() => navigate('/estoque')}
                            />
                            <Card
                                titulo="Estoque abaixo do mínimo"
                                valor={e?.produtos_abaixo_minimo}
                                sub={e?.produtos_abaixo_minimo > 0 ? 'atenção necessária' : 'tudo em ordem'}
                                cor={e?.produtos_abaixo_minimo > 0 ? '#e65100' : '#2d6a4f'}
                                onClick={() => navigate('/estoque')}
                            />
                            <Card
                                titulo="Total de compras"
                                valor={o?.total_compras}
                                sub="entradas registradas"
                                cor="#37474f"
                            />
                        </Secao>

                        <Secao titulo="Cadastros">
                            <Card
                                titulo="Clientes"
                                valor={c?.clientes}
                                cor="#546e7a"
                                onClick={() => navigate('/clientes')}
                            />
                            <Card
                                titulo="Fornecedores"
                                valor={c?.fornecedores}
                                cor="#546e7a"
                                onClick={() => navigate('/fornecedores')}
                            />
                            <Card
                                titulo="Usuários do sistema"
                                valor={c?.usuarios}
                                cor="#546e7a"
                                onClick={() => navigate('/usuarios')}
                            />
                        </Secao>
                    </>
                )}
            </main>
        </div>
    )
}

const s = {
    container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' },
    main:  { flex: 1, padding: '24px' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    titulo: { fontSize: '20px', fontWeight: '600', color: '#222', margin: 0 },
    attRow: { display: 'flex', alignItems: 'center', gap: '12px' },
    attTexto: { fontSize: '12px', color: '#888' },
    btnRefresh: { backgroundColor: '#fff', border: '1px solid #ddd', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
    erro: { color: '#e53935', marginBottom: '16px' },
    carregando: { color: '#888', fontSize: '14px' },
    secao: { marginBottom: '28px' },
    secaoTitulo: { fontSize: '13px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '6px' },
    cardGrid: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
    card: { backgroundColor: '#fff', borderRadius: '8px', padding: '16px 20px', minWidth: '160px', flex: '1 1 160px', maxWidth: '220px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
    cardTitulo: { fontSize: '12px', color: '#888', marginBottom: '8px', margin: 0 },
    cardValor: { fontSize: '32px', fontWeight: '700', margin: '6px 0 4px' },
    cardSub: { fontSize: '11px', color: '#aaa', margin: 0 },
}

export default Dashboard
