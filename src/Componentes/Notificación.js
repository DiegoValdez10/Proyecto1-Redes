import React, { useEffect, useState, useCallback } from 'react';
import { xml } from '@xmpp/client';
import { useUser } from '../UserContext';

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const { xmppClient, updateContacts } = useUser();

  const addNotification = useCallback((message) => {
    setNotifications(prev => [...prev, { id: Date.now(), message }]);
  }, []);

  useEffect(() => {
    if (!xmppClient) return;

    const handleStanza = (stanza) => {
      if (stanza.is('message')) {
        handleMessage(stanza);
      } else if (stanza.is('presence')) {
        handlePresence(stanza);
      }
    };

    const handleMessage = (stanza) => {
      const from = stanza.attrs.from.split('@')[0];
      const body = stanza.getChildText('body');
      if (body) {
        addNotification(`Nuevo mensaje de ${from}: ${body}`);
      }
    };

    const handlePresence = (stanza) => {
      const from = stanza.attrs.from;
      const type = stanza.attrs.type;
      if (type === 'subscribe') {
        addFriendRequest(from);
      }
    };

    const addFriendRequest = (from) => {
      setFriendRequests(prev => [...prev, { id: Date.now(), from }]);
    };

    xmppClient.on('stanza', handleStanza);

    return () => {
      xmppClient.off('stanza', handleStanza);
    };
  }, [xmppClient, addNotification]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleFriendRequest = async (id, accept) => {
    const request = friendRequests.find(req => req.id === id);
    if (request) {
      try {
        const presence = xml('presence', { to: request.from, type: accept ? 'subscribed' : 'unsubscribed' });
        await xmppClient.send(presence);

        if (accept) {
          // Enviar una solicitud de suscripción de vuelta
          const subscribePresence = xml('presence', { to: request.from, type: 'subscribe' });
          await xmppClient.send(subscribePresence);

          // Actualizar la lista de contactos
          const newContact = request.from.split('@')[0];
          updateContacts(prevContacts => [...prevContacts, newContact]);
          
          addNotification(`${newContact} ha sido añadido a tu lista de contactos.`);
        }

        setFriendRequests(prev => prev.filter(req => req.id !== id));
      } catch (error) {
        console.error('Error al procesar la solicitud de amistad:', error);
        addNotification('Hubo un error al procesar la solicitud de amistad. Por favor, inténtalo de nuevo.');
      }
    }
  };

  return (
    <div style={styles.notificationContainer}>
      {notifications.map(notif => (
        <div key={notif.id} style={styles.notification}>
          <p>{notif.message}</p>
          <button onClick={() => removeNotification(notif.id)} style={styles.closeButton}>
            X
          </button>
        </div>
      ))}
      {friendRequests.map(request => (
        <div key={request.id} style={styles.friendRequest}>
          <p>{request.from.split('@')[0]} quiere añadirte como amigo</p>
          <div>
            <button onClick={() => handleFriendRequest(request.id, true)} style={styles.acceptButton}>
              Aceptar
            </button>
            <button onClick={() => handleFriendRequest(request.id, false)} style={styles.denyButton}>
              Denegar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles =  {
  notificationContainer: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    maxWidth: '300px',
    zIndex: 1000,
  },
  notification: {
    backgroundColor: '#f8f8f8',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '10px',
    marginBottom: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#999',
  },
  friendRequest: {
    backgroundColor: '#e6f7ff',
    border: '1px solid #91d5ff',
    borderRadius: '4px',
    padding: '10px',
    marginBottom: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  acceptButton: {
    backgroundColor: '#52c41a',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 10px',
    marginRight: '10px',
    cursor: 'pointer',
  },
  denyButton: {
    backgroundColor: '#f5222d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '5px 10px',
    cursor: 'pointer',
  },
};

export default Notification;