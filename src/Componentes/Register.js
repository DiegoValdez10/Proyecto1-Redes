import React, { useState } from 'react';
import { client, xml } from '@xmpp/client';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();
  const { login } = useUser();

  const adminUsername = 'val213281-test1';
  const adminPassword = '1234';

  const handleRegister = async (e) => {
    e.preventDefault();
  
    const adminXmpp = client({
      service: 'ws://alumchat.lol:7070/ws/',
      domain: 'alumchat.lol',
      resource: 'example',
      username: adminUsername,
      password: adminPassword,
    });
  
    adminXmpp.on('error', (err) => {
      console.error('❌ Error:', err.toString());
      setError('Error al conectar con el servidor. Inténtalo de nuevo más tarde.');
    });
  
    adminXmpp.on('status', (status) => {
      console.log('🛈 Estado:', status);
      setStatus(status);
    });
  
    adminXmpp.on('stanza', (stanza) => {
      console.log('🔍 Stanza recibida:', stanza.toString());
    });
  
    adminXmpp.on('online', async (address) => {
      console.log('✅ Admin conectado como', address.toString());
      setStatus('Conectado como admin');
      setError('');
  
      try {
        const registerIQ = xml(
          'iq',
          { type: 'set', to: 'alumchat.lol', id: 'reg1' },
          xml(
            'query',
            { xmlns: 'jabber:iq:register' },
            xml('username', {}, username),
            xml('password', {}, password)
          )
        );
  
        console.log('🔍 Enviando solicitud de registro:', registerIQ.toString());
  
        const registerPromise = new Promise((resolve, reject) => {
          adminXmpp.on('stanza', (stanza) => {
            if (stanza.attrs.id === 'reg1') {
              resolve(stanza);
            }
          });
  
          setTimeout(() => reject(new Error('Tiempo de espera agotado')), 10000);
        });
  
        adminXmpp.send(registerIQ);
  
        const response = await registerPromise;
  
        console.log('🔍 Respuesta del servidor:', response.toString());
  
        if (response.attrs.type === 'result') {
          setStatus('Usuario registrado exitosamente');
          setError('');
          
          // Cerrar la conexión del admin
          await adminXmpp.stop();
          
          // Iniciar sesión con el nuevo usuario
          const userXmpp = client({
            service: 'ws://alumchat.lol:7070/ws/',
            domain: 'alumchat.lol',
            resource: 'example',
            username: username,
            password: password,
          });

          userXmpp.on('online', async (address) => {
            console.log('✅ Usuario conectado como', address.toString());
            try {
              await userXmpp.send(xml('presence', { type: 'available' }));
              login(username, password, userXmpp);
              navigate('/chat');
            } catch (error) {
              console.error('Error al enviar presencia:', error);
              setError('No se pudo enviar la presencia.');
            }
          });

          await userXmpp.start();
        } else if (response.attrs.type === 'error') {
          const errorElement = response.getChild('error');
          if (errorElement && errorElement.attrs.code === '409') {
            setError(`El nombre de usuario "${username}" ya está en uso. Por favor, elige otro.`);
          } else {
            const errorText = errorElement ? errorElement.getChildText('text') : 'Error desconocido al registrar el usuario.';
            setError(errorText || 'Error al registrar el usuario.');
          }
        } else {
          setError('Respuesta inesperada del servidor. Por favor, inténtalo de nuevo.');
        }
      } catch (error) {
        console.error('Error al registrar:', error);
        setError(`No se pudo registrar el usuario: ${error.message}`);
      } finally {
        await adminXmpp.stop();
        console.log('🔴 Admin desconectado');
      }
    });
  
    adminXmpp.on('offline', () => {
      console.log('🔴 Desconectado');
      setStatus('Desconectado');
    });
  
    try {
      await adminXmpp.start();
      console.log('Intentando conectar como admin...');
    } catch (err) {
      console.error('No se pudo conectar:', err);
      setError('No se pudo conectar al servidor.');
    }
  };

  return (
    <div style={styles.registerBox}>
      <h2>Registrarse</h2>
      <form style={styles.form} onSubmit={handleRegister}>
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
        <div style={styles.loginLink}>
          <Link to="/" style={styles.link}>Ya tengo una cuenta</Link>
        </div>
        <button type="submit" style={styles.button}>Registrarse</button>
      </form>
    </div>
  );
}

const styles = {
  registerBox: {
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
  loginLink: {
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

export default Register;