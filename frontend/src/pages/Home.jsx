import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'

function CardAcao({ nome, caminho, descricao, navigate }) {
    return (
        <button style={s.cardAcao} onClick={() => navigate(caminho)}>
            <span style={s.cardNomeGrande}>{nome}</span>
            {descricao && <span style={s.cardDesc}>{descricao}</span>}
        </button>
    )
}

function CardLateral({ nome, caminho, navigate }) {
    return (
        <button style={s.cardLateral} onClick={() => navigate(caminho)}>
            <span style={s.cardNomePequeno}>{nome}</span>
        </button>
    )
}

function Home() {
    const navigate = useNavigate()
    const { usuario } = useAuth()
    const isGerente = usuario?.perfil_acesso === 'Gerente'

    return (
        <div style={s.page}>
            <Header />

            <main style={s.main}>
                <div style={s.layout}>

                    {/* ── Coluna central: ações ── */}
                    <section style={s.secaoAcoes}>
                        <p style={s.secaoTitulo}>Operações</p>
                        <div style={s.gridAcoes}>
                            <CardAcao nome="Consumo"  caminho="/consumo"      descricao="Abrir / gerenciar comandas" navigate={navigate} />
                            <CardAcao nome="Débitos"  caminho="/debitos"      descricao="Fichas e quitações"         navigate={navigate} />
                            {isGerente && (
                                <CardAcao nome="Compras" caminho="/compras/nova" descricao="Registrar entrada de estoque" navigate={navigate} />
                            )}
                        </div>
                    </section>

                    {/* ── Coluna lateral direita ── */}
                    <aside style={s.aside}>

                        <div style={s.asideBloco}>
                            <p style={s.secaoTitulo}>Cadastros</p>
                            <div style={s.gridLateral}>
                                <CardLateral nome="Clientes"     caminho="/clientes"     navigate={navigate} />
                                <CardLateral nome="Estoque"      caminho="/estoque"      navigate={navigate} />
                                {isGerente && (
                                    <CardLateral nome="Fornecedores" caminho="/fornecedores" navigate={navigate} />
                                )}
                            </div>
                        </div>

                        <div style={s.asideBloco}>
                            <p style={s.secaoTitulo}>Sistema</p>
                            <div style={s.gridLateral}>
                                <CardLateral nome="Dashboard" caminho="/dashboard" navigate={navigate} />
                                {isGerente && (
                                    <>
                                        <CardLateral nome="Usuários" caminho="/usuarios" navigate={navigate} />
                                        <CardLateral nome="Logs"     caminho="/logs"     navigate={navigate} />
                                    </>
                                )}
                            </div>
                        </div>

                    </aside>
                </div>
            </main>
        </div>
    )
}

const s = {
    page:            { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' },
    main:            { flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 24px' },
    layout:          { display: 'flex', gap: 32, width: '100%', maxWidth: 900, alignItems: 'flex-start' },

    // Seção de ações
    secaoAcoes:      { flex: 1 },
    secaoTitulo:     { fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' },
    gridAcoes:       { display: 'flex', flexDirection: 'column', gap: 12 },

    cardAcao:        {
        display: 'flex', alignItems: 'center', gap: 16,
        background: '#fff', border: '1px solid #e4e4e4', borderRadius: 10,
        padding: '20px 24px', cursor: 'pointer', textAlign: 'left',
        transition: 'box-shadow 0.15s',
        width: '100%',
    },
    cardNomeGrande:  { fontSize: 17, fontWeight: 700, color: '#222' },
    cardDesc:        { fontSize: 13, color: '#999', marginLeft: 'auto' },

    // Aside lateral
    aside:           { width: 220, display: 'flex', flexDirection: 'column', gap: 28, flexShrink: 0 },
    asideBloco:      {},
    gridLateral:     { display: 'flex', flexDirection: 'column', gap: 8 },

    cardLateral:     {
        display: 'flex', alignItems: 'center', gap: 10,
        background: '#fff', border: '1px solid #e4e4e4', borderRadius: 8,
        padding: '12px 16px', cursor: 'pointer', textAlign: 'left',
        width: '100%',
    },
    cardNomePequeno: { fontSize: 14, fontWeight: 600, color: '#333' },
}

export default Home