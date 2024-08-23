import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../UserContext';
import { xml } from '@xmpp/client';

function ChatWindow({ contact }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const { xmppClient, user } = useUser();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([]);

    if (xmppClient && contact && user?.username) {
      const handleMessage = (stanza) => {
        if (stanza.is('message')) {
          const from = stanza.attrs.from.split('/')[0];
          const body = stanza.getChildText('body');

          if (body) {
            if (stanza.attrs.type === 'chat' && from === contact.jid) {
              setMessages(prev => [...prev, { from: 'them', content: body }]);
            } else if (stanza.attrs.type === 'groupchat') {
              const groupJid = stanza.attrs.from.split('/')[0];
              const sender = stanza.attrs.from.split('/')[1];

              if (groupJid === contact.jid) {
                const isCurrentUser = sender === user.username;
                setMessages(prev => [...prev, { 
                  from: isCurrentUser ? 'me' : sender, 
                  content: body, 
                  group: true 
                }]);
              }
            }
          }
        }
      };

      xmppClient.on('stanza', handleMessage);

      return () => {
        xmppClient.off('stanza', handleMessage);
      };
    }
  }, [xmppClient, contact, user]);

  const sendMessage = () => {
    if (inputMessage.trim() && xmppClient && contact) {
      const messageType = contact.isGroup ? 'groupchat' : 'chat';

      xmppClient.send(
        xml('message', { to: contact.jid, type: messageType },
          xml('body', {}, inputMessage)
        )
      );

      setMessages(prev => [...prev, { 
        from: 'me', 
        content: inputMessage, 
        group: contact.isGroup 
      }]);

      setInputMessage('');
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!contact) {
    return <div style={styles.chatWindow}>Selecciona un contacto para comenzar a chatear</div>;
  }

  return (
    <div style={styles.chatWindow}>
      <div style={styles.header}>
        <h2>{contact.name}</h2>
      </div>
      <div style={styles.messages}>
        {messages.map((msg, index) => (
          <div key={index} style={msg.from === 'me' ? styles.myMessage : styles.theirMessage}>
            {msg.group && msg.from !== 'me' && <strong>{msg.from}: </strong>}
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={styles.inputArea}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          style={styles.input}
          placeholder="Escribe un mensaje..."
        />
        <button onClick={sendMessage} style={styles.sendButton}>Enviar</button>
      </div>
    </div>
  );
}

const styles = {
  chatWindow: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  header: {
    padding: '10px',
    borderBottom: '1px solid #ccc',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
  },
  myMessage: {
    backgroundColor: '#dcf8c6',
    padding: '10px',
    borderRadius: '10px',
    marginBottom: '10px',
    alignSelf: 'flex-end',
    maxWidth: '70%',
  },
  theirMessage: {
    backgroundColor: '#cce5ff',
    padding: '10px',
    borderRadius: '10px',
    marginBottom: '10px',
    alignSelf: 'flex-start',
    maxWidth: '70%',
  },
  inputArea: {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #ccc',
    backgroundColor: '#f1f1f1',
    position: 'sticky',
    bottom: '0',
    width: '100%',
    boxSizing: 'border-box',
  },
  input: {
    flex: 1,
    padding: '10px',
    fontSize: '16px',
    borderRadius: '20px',
    border: '1px solid #ccc',
    marginRight: '10px',
  },
  sendButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
  },
};

export default ChatWindow;
