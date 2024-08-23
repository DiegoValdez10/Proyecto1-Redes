import React, { useState } from 'react';
import { client, xml } from '@xmpp/client';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();
  const { login } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();

    const xmpp = client({
      service: 'ws://alumchat.lol:7070/ws/',
      domain: 'alumchat.lol',
      resource: 'example',
      username: username,
      password: password,
    });

    xmpp.on('error', (err) => {
      console.error('❌ Error:', err.toString());
      setError('Error al iniciar sesión. Verifica tus credenciales.');
    });

    xmpp.on('status', (status) => {
      console.log('🛈 Estado:', status);
      setStatus(status);
    });

    xmpp.on('online', async (address) => {
      console.log('✅ Conectado como', address.toString());
      setStatus('Conectado');
      setError('');
      try {
        await xmpp.send(xml('presence', { type: 'available' }));
        login(username, password, xmpp);
        navigate('/chat');
      } catch (error) {
        console.error('Error al enviar presencia:', error);
        setError('No se pudo enviar la presencia.');
      }
    });

    xmpp.on('offline', () => {
      console.log('🔴 Desconectado');
      setError('Desconectado del servidor XMPP.');
      setStatus('Desconectado');
    });

    try {
      await xmpp.start();
      console.log('Intentando conectarse...');
    } catch (err) {
      console.error('No se pudo conectar:', err);
      setError('No se pudo conectar al servidor.');
    }
  };

  return (
    <div style={styles.loginBox}>
      <h2>Iniciar Sesión</h2>
      <form style={styles.form} onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Usuario"
          style={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={styles.error}>{error}</p>}
        {status && <p style={styles.status}>{status}</p>}
        <div style={styles.registerLink}>
          <Link to="/registro" style={styles.link}>Registrarse</Link>
        </div>
        <button type="submit" style={styles.button}>Iniciar Sesión</button>
      </form>
    </div>
  );
}

const styles = {
  loginBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    width: '50%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  registerLink: {
    marginBottom: '10px',
  },
  link: {
    color: '#007BFF',
    textDecoration: 'none',
  },
  button: {
    width: '50%',
    padding: '10px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
  },
  status: {
    color: 'green',
    marginBottom: '10px',
  },
};

export default Login;