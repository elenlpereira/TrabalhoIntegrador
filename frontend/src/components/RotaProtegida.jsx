import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// apenasGerente: se true, bloqueia Atendentes com mensagem de acesso negado
function RotaProtegida({ children, apenasGerente = false }) {
    const { usuario } = useAuth()

    if (!usuario) {
        return <Navigate to="/login" replace />
    }

    if (apenasGerente && usuario.perfil_acesso !== 'Gerente') {
        return (
            <div style={styles.container}>
                <h2 style={styles.titulo}>Acesso negado</h2>
                <p style={styles.msg}>Esta área é restrita a Gerentes.</p>
            </div>
        )
    }

    return children
}

const styles = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '12px' },
    titulo: { color: '#e53935', fontSize: '24px' },
    msg: { color: '#555', fontSize: '16px' },
}

export default RotaProtegida
