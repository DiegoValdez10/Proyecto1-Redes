import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { useUser } from '../UserContext';
import { client, xml } from '@xmpp/client';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, xmppClient } = useUser();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    if (xmppClient) {
      xmppClient.stop();
    }
    logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (!user || !xmppClient) {
      console.error('El usuario no está conectado o el cliente XMPP no está disponible');
      return;
    }

    const xmppClientDelete = client({
      service: xmppClient.options.service,
      domain: xmppClient.options.domain,
      username: user.username,
      password: user.password,
    });

    xmppClientDelete.on('error', err => {
      console.error('❌', err.toString());
    });

    xmppClientDelete.on('online', async () => {
      console.log('🟢', 'Conectado como', xmppClientDelete.jid.toString());

      try {
        const deleteIQ = xml(
          'iq',
          { type: 'set', id: 'delete1' },
          xml('query', { xmlns: 'jabber:iq:register' }, xml('remove'))
        );

        const response = await xmppClientDelete.send(deleteIQ);

        if (response) {
          console.log('🟢 Respuesta del servidor:', response.toString());
        } else {
          console.warn('⚠ No se recibió respuesta del servidor o la respuesta está vacía');
        }

        xmppClientDelete.stop();  
        logout();
        navigate('/', { replace: true });
      } catch (err) {
        console.error('❌ Error al eliminar la cuenta:', err.toString());
      }
    });

    try {
      await xmppClientDelete.start();
    } catch (err) {
      console.error('❌ Error al iniciar el cliente XMPP:', err.toString());
    }
  };

  return (
    <div style={styles.navbar}>
      <Link to="/chat" style={styles.navLink}>Chat</Link>
      <Link to="/contacto" style={styles.navLink}>Agregar contacto</Link>
      <a href="#" style={styles.navLink}>Chats grupales</a>
      <Link to="/Status" style={styles.navLink}>Status</Link>
      <div style={styles.userIcon} onClick={toggleMenu}>
        <FaUser size={24} />
        {isMenuOpen && (
          <div style={styles.dropdownMenu}>
            <button style={styles.dropdownItem} onClick={handleLogout}>Cerrar sesión</button>
            <button style={styles.dropdownItem} onClick={handleDeleteAccount}>Eliminar cuenta</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '10px',
    backgroundColor: '#007BFF',
    color: '#fff',
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '18px',
  },
  userIcon: {
    position: 'relative',
    cursor: 'pointer',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '30px',
    right: '0',
    backgroundColor: '#fff',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    zIndex: 1000,
  },
  dropdownItem: {
    padding: '10px 20px',
    width: '150px',
    backgroundColor: '#fff',
    border: 'none',
    textAlign: 'left',
    color: '#007BFF',
    cursor: 'pointer',
  },
};

export default Navbar;
