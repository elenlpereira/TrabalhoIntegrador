import { useNavigate } from 'react-router-dom'

function Home() {
    const navigate = useNavigate()

    const modulos = [
        { nome: 'Consumo',       caminho: '/consumo' },
        { nome: 'Pagamento',     caminho: '/pagamento' },
        { nome: 'Estoque',       caminho: '/estoque' },
        { nome: 'Fornecedores',  caminho: '/fornecedores' },
    ]

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <span style={styles.logo}>Bar Pereira</span>
                <button style={styles.btnSair}>Sair</button>
            </header>

            <main style={styles.main}>
                <div style={styles.grid}>
                    {modulos.map(m => (
                        <button
                            key={m.nome}
                            style={styles.card}
                            onClick={() => navigate(m.caminho)}
                        >
                            {m.nome}
                        </button>
                    ))}
                </div>
                <p style={styles.dica}>Selecione um módulo para começar.</p>
            </main>
        </div>
    )
}

const styles = {
    container: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', backgroundColor: '#fff', borderBottom: '1px solid #ddd' },
    logo: { fontWeight: 'bold', fontSize: '18px' },
    btnSair: { backgroundColor: '#e53935', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
    main: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' },
    grid: { display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' },
    card: { width: '140px', height: '120px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', cursor: 'pointer', fontWeight: '500' },
    dica: { color: '#888', fontSize: '14px' },
}

export default Home