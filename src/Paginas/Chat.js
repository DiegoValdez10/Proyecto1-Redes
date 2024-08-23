import React, { useState } from 'react';
import Navbar from '../Componentes/navbar';
import ContactList from '../Componentes/ContactList';
import ChatWindow from '../Componentes/ChatWindow';
import Notificacion from '../Componentes/Notificación'

function Chat() {
  const [selectedContact, setSelectedContact] = useState(null);

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
  };

  return (
    <div style={styles.chatContainer}>
      <Navbar />
      <Notificacion />
      <div style={styles.mainContent}>
        <ContactList onSelectContact={handleSelectContact} />
        <ChatWindow contact={selectedContact} />
      </div>
    </div>
  );
}

const styles = {
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  mainContent: {
    display: 'flex',
    flex: 1,
  },
};

export default Chat;
