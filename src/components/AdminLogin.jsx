import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBackendUrl } from '../utils/urlHelper';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch(`${getBackendUrl()}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('adminToken', data.token);
                navigate('/admin/dashboard');
            } else {
                setError(data.error || 'Giriş yapılamadı');
            }
        } catch (err) {
            setError('Sunucu hatası');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.title}>Admin Girişi</h1>
                <p style={styles.subtitle}>Yönetim paneline erişmek için giriş yapın.</p>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleLogin} style={styles.form}>
                    <input
                        type="email"
                        placeholder="E-posta"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Şifre"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <button type="submit" style={styles.button}>Giriş Yap</button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f7',
        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    card: {
        background: 'white',
        padding: '60px 40px',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
    },
    title: {
        fontSize: '1.8rem',
        fontWeight: '700',
        marginBottom: '10px',
        color: '#1d1d1f'
    },
    subtitle: {
        fontSize: '1rem',
        color: '#86868b',
        marginBottom: '40px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    input: {
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #d2d2d7',
        fontSize: '1rem',
        outline: 'none',
        background: '#fbfbfd'
    },
    button: {
        padding: '16px',
        borderRadius: '100px',
        border: 'none',
        background: '#0071e3',
        color: 'white',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background 0.2s',
        marginTop: '10px'
    },
    error: {
        color: '#ff3b30',
        marginBottom: '20px',
        fontSize: '0.9rem'
    }
};

export default AdminLogin;
