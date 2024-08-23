import React, { useState, useEffect } from 'react';
import { useUser } from '../UserContext';
import { xml } from '@xmpp/client';

const Status = () => {
  const [status, setStatus] = useState('available');
  const [statusMessage, setStatusMessage] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, xmppClient } = useUser();

  useEffect(() => {
    // Cargar el estado inicial del usuario
    if (xmppClient) {
      xmppClient.send(xml('presence'));
    }
  }, [xmppClient]);

  const handleStatusClick = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setDropdownOpen(false);
    sendPresence(newStatus, statusMessage);
  };

  const handleStatusMessageChange = (e) => {
    setStatusMessage(e.target.value);
  };

  const sendPresence = (currentStatus, currentStatusMessage) => {
    if (xmppClient) {
      let presenceStanza = xml('presence');
      
      if (currentStatus !== 'available') {
        presenceStanza.c('show').t(currentStatus);
      }
      
      if (currentStatusMessage) {
        presenceStanza.c('status').t(currentStatusMessage);
      }

      xmppClient.send(presenceStanza);
    }
  };

  const handleSendStatusMessage = () => {
    sendPresence(status, statusMessage);
  };

  return (
    <div style={styles.container}>
      <div style={styles.username}>{user?.username || 'Usuario'}</div>
      <div style={styles.statusContainer}>
        <button onClick={handleStatusClick} style={styles.statusButton}>
          {status}
        </button>
        {dropdownOpen && (
          <div style={styles.dropdown}>
            <div style={styles.dropdownItem} onClick={() => handleStatusChange('available')}>Available</div>
            <div style={styles.dropdownItem} onClick={() => handleStatusChange('away')}>Away</div>
            <div style={styles.dropdownItem} onClick={() => handleStatusChange('xa')}>Not Available</div>
            <div style={styles.dropdownItem} onClick={() => handleStatusChange('dnd')}>Busy</div>
          </div>
        )}
      </div>
      <textarea
        placeholder="Enter your status message..."
        value={statusMessage}
        onChange={handleStatusMessageChange}
        style={styles.textBox}
      />
      <button onClick={handleSendStatusMessage} style={styles.sendButton}>
        Send Status Message
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '100vh',
    textAlign: 'center',
    padding: '20px',
  },
  username: {
    fontSize: '24px',
    marginBottom: '20px',
  },
  statusContainer: {
    position: 'relative',
    marginBottom: '20px',
    width: '300px',
  },
  statusButton: {
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '20px',
    border: '1px solid #ccc',
    cursor: 'pointer',
    width: '100%',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: '0',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '5px',
    overflow: 'hidden',
    zIndex: 1,
    width: '100%',
    textAlign: 'left',
    marginTop: '5px',
  },
  dropdownItem: {
    padding: '10px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#f0f0f0',
    },
  },
  textBox: {
    width: '300px',
    height: '100px',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
    resize: 'vertical',
    marginBottom: '10px',
  },
  sendButton: {
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#007BFF',
    color: 'white',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#45a049',
    },
  },
};

export default Status;