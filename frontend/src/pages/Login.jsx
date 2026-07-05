import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [form, setForm] = useState({ email: '', senha: '' })
    const [erro, setErro] = useState(null)
    const [carregando, setCarregando] = useState(false)

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setErro(null)
        setCarregando(true)
        try {
            await login(form.email, form.senha)
            navigate('/')
        } catch (err) {
            setErro(err.response?.data?.erro || 'Erro ao realizar login')
        } finally {
            setCarregando(false)
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.titulo}>Bar Pereira</h1>
                <p style={styles.subtitulo}>Sistema de Gerenciamento</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.campo}>
                        <label style={styles.label}>E-mail</label>
                        <input
                            style={styles.input}
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="seu@email.com"
                            autoFocus
                        />
                    </div>

                    <div style={styles.campo}>
                        <label style={styles.label}>Senha</label>
                        <input
                            style={styles.input}
                            type="password"
                            name="senha"
                            value={form.senha}
                            onChange={handleChange}
                            placeholder="••••••"
                        />
                    </div>

                    {erro && <p style={styles.erro}>{erro}</p>}

                    <button
                        type="submit"
                        style={{ ...styles.btnEntrar, opacity: carregando ? 0.7 : 1 }}
                        disabled={carregando}
                    >
                        {carregando ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    )
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
    card: {
        backgroundColor: '#fff',
        padding: '40px 32px',
        borderRadius: '8px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '360px',
    },
    titulo: { textAlign: 'center', fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '4px' },
    subtitulo: { textAlign: 'center', fontSize: '14px', color: '#888', marginBottom: '28px' },
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    campo: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '13px', fontWeight: '500', color: '#333' },
    input: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' },
    erro: { color: '#e53935', fontSize: '13px', textAlign: 'center' },
    btnEntrar: {
        backgroundColor: '#2d6a4f',
        color: '#fff',
        border: 'none',
        padding: '11px',
        borderRadius: '4px',
        fontSize: '15px',
        fontWeight: '500',
        cursor: 'pointer',
        marginTop: '4px',
    },
}

export default Login
