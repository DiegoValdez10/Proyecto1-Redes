import React, { useState, useEffect } from 'react';
import { useUser } from '../UserContext';
import { xml } from '@xmpp/client';

function ContactList({ onSelectContact }) {
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { xmppClient, isConnected } = useUser();
  const [showInfo, setShowInfo] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    if (!isConnected || !xmppClient) {
      setError("Por favor, inicia sesión primero.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        xmppClient.send(
          xml('iq', { type: 'get', id: 'roster1' },
            xml('query', { xmlns: 'jabber:iq:roster' })
          )
        );

        xmppClient.send(
          xml('iq', { type: 'get', to: 'conference.alumchat.lol', id: 'disco1' },
            xml('query', { xmlns: 'http://jabber.org/protocol/disco#items' })
          )
        );
      } catch (err) {
        console.error("Error al enviar solicitudes:", err);
        setError("Error al solicitar datos al servidor XMPP.");
      }
    };

    fetchData();

    const handleStanza = (stanza) => {
      console.log('Stanza recibida:', stanza.toString());
    
      if (stanza.is('presence')) {
        const status = stanza.getChildText('status'); // Extrae el texto del elemento <status>
        console.log('Estado:', status); // Esto debería mostrar el estado, como "hola" si fue enviado correctamente
    
        if (status !== null) {
          console.log('Estado de presencia recibido:', status);
        } else {
          console.log('No se encontró un mensaje de estado en la estrofa de presencia.');
        }
      }
    


      if (stanza.is('iq') && stanza.attrs.id === 'roster1') {
        const query = stanza.getChild('query');
        if (query) {
          const items = query.getChildren('item');
          const contactsList = items.map(item => ({
            name: item.attrs.name || item.attrs.jid.split('@')[0],
            jid: item.attrs.jid,
            type: 'contact',
            status: 'offline',
            statusMessage: ''
          }));
          setContacts(contactsList);
          setLoading(false);

          contactsList.forEach(contact => {
            xmppClient.send(xml('presence', { to: contact.jid }));
          });
        }
      }

      if (stanza.is('iq') && stanza.attrs.id === 'disco1') {
        const query = stanza.getChild('query');
        if (query) {
          const items = query.getChildren('item');
          const groupsList = items.map(item => ({
            name: item.attrs.name || item.attrs.jid.split('@')[0],
            jid: item.attrs.jid,
            type: 'group',
            isGroup: true
          }));
          setGroups(groupsList);
          setLoading(false);
        }
      }

      if (stanza.is('presence')) {
        console.log('Evento de presencia recibido:', stanza.toString());
        const from = stanza.attrs.from.split('/')[0];
        const type = stanza.attrs.type;
        const show = stanza.getChildText('show');
        const statusMessage = stanza.getChildText('status') || '';

        let newStatus = 'offline';
        if (!type) {
          if (!show) {
            newStatus = 'available';
          } else {
            switch (show) {
              case 'away':
                newStatus = 'away';
                break;
              case 'xa':
                newStatus = 'not available';
                break;
              case 'dnd':
                newStatus = 'busy';
                break;
              default:
                newStatus = 'available';
            }
          }
        }

        setContacts(prevContacts =>
          prevContacts.map(contact =>
            contact.jid === from ? { ...contact, status: newStatus, statusMessage } : contact
          )
        );
      }
    };

    xmppClient.on('stanza', handleStanza);

    return () => {
      xmppClient.off('stanza', handleStanza);
    };
  }, [xmppClient, isConnected]);

  const handleInfoClick = (contact, e) => {
    e.stopPropagation();
    setSelectedContact(contact);
    setShowInfo(true);
  };

  const closeInfo = () => {
    setShowInfo(false);
    setSelectedContact(null);
  };

  if (loading) {
    return <div>Cargando contactos...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <h2>Contactos</h2>
      <ul style={styles.list}>
        {contacts.map(contact => (
          <li key={contact.jid} style={styles.contactItem}>
            <div onClick={() => onSelectContact(contact)}>
              {contact.name} - {contact.status}
            </div>
            <div style={styles.menuDots} onClick={(e) => handleInfoClick(contact, e)}>
              ⋮
            </div>
          </li>
        ))}
      </ul>
      <h2>Chats Grupales</h2>
      <ul style={styles.list}>
        {groups.map(group => (
          <li key={group.jid} style={styles.groupItem} onClick={() => onSelectContact(group)}>
            {group.name}
          </li>
        ))}
      </ul>
      {showInfo && selectedContact && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <span style={styles.closeButton} onClick={closeInfo}>&times;</span>
            <h3>Información del contacto</h3>
            <p>Usuario: {selectedContact.name}</p>
            <p>Estado: {selectedContact.status}</p>
            <p>Mensaje de estado: {selectedContact.statusMessage || 'No hay mensaje de estado'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '10px',
    borderRight: '1px solid #ccc',
    height: '100vh',
    overflowY: 'auto',
    boxSizing: 'border-box',
    position: 'relative',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
  },
  contactItem: {
    padding: '10px',
    cursor: 'pointer',
    borderBottom: '1px solid #ccc',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupItem: {
    padding: '10px',
    cursor: 'pointer',
    borderBottom: '1px solid #ccc',
  },
  menuDots: {
    fontSize: '20px',
    cursor: 'pointer',
  },
  modal: {
    position: 'fixed',
    zIndex: 1,
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    overflow: 'auto',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fefefe',
    margin: '15% auto',
    padding: '20px',
    border: '1px solid #888',
    width: '80%',
    maxWidth: '500px',
    position: 'relative',
  },
  closeButton: {
    color: '#aaa',
    float: 'right',
    fontSize: '28px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default ContactList;
