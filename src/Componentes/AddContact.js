import React, { useState } from 'react';
import { client, xml } from '@xmpp/client';
import { useUser } from '../UserContext'; // Importa el hook useUser

function AddContact() {
  const { user } = useUser(); // Obtén el usuario del contexto
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Nuevo estado para el mensaje de éxito

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };

  const toggleStatus = () => {
    setShowStatus(!showStatus);
  };

  const fetchContacts = () => {
    // Implementa aquí la lógica para obtener la lista de contactos.
  };

  const addContact = async (username) => {
    if (!user) {
      setError('No estás autenticado. Inicia sesión primero.');
      return;
    }

    const xmppClient = client({
      service: 'ws://alumchat.lol:7070/ws/',
      domain: 'alumchat.lol',
      username: user.username, // Utiliza el usuario autenticado
      password: user.password, // Utiliza la contraseña del usuario autenticado
    });

    xmppClient.on('error', err => {
      console.error('❌ Error en el cliente XMPP:', err.toString());
      setError('Error en el cliente XMPP: ' + err.toString());
    });

    xmppClient.on('online', async () => {
      console.log('🟢 Conectado como', xmppClient.jid.toString());

      try {
        const addContactIQ = xml(
          'iq',
          { type: 'set', id: 'addContact1' },
          xml('query', { xmlns: 'jabber:iq:roster' },
            xml('item', { jid: `${username}@alumchat.lol`, name: username })
          )
        );

        await xmppClient.send(addContactIQ);
        const subscribePresence = xml(
          'presence',
          { type: 'subscribe', to: `${username}@alumchat.lol` }
        );

        await xmppClient.send(subscribePresence);
        console.log('🟢 Contacto agregado:', username);
        setSuccessMessage('Contacto agregado correctamente.'); // Establece el mensaje de éxito
        fetchContacts();
      } catch (err) {
        console.error('❌ Error al agregar contacto:', err.toString());
        setError('Error al agregar contacto: ' + err.toString());
      } finally {
        xmppClient.stop();
      }
    });

    try {
      await xmppClient.start();
    } catch (err) {
      console.error('❌ Error al iniciar el cliente XMPP:', err.toString());
      setError('Error al iniciar el cliente XMPP: ' + err.toString());
    }
  };

  const handleAddContact = async (event) => {
    event.preventDefault();
    const username = email.split('@')[0]; // Extrae el nombre de usuario del correo
    await addContact(username);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleAddContact} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.label}>Correo del Contacto:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="message" style={styles.label}>Mensaje:</label>
          <textarea
            id="message"
            value={message}
            onChange={handleMessageChange}
            required
            style={styles.textarea}
          />
        </div>
        <div style={styles.buttonContainer}>
          <button type="button" onClick={toggleStatus} style={styles.toggleButton}>
            {showStatus ? 'Ocultar Estado' : 'Mostrar Estado'}
          </button>
        </div>
        {showStatus && (
          <div style={styles.status}>
            <p>Estado: Contacto en proceso de añadir.</p>
          </div>
        )}
        {successMessage && (
          <div style={styles.success}>
            <p>{successMessage}</p>
          </div>
        )}
        {error && (
          <div style={styles.error}>
            <p>{error}</p>
          </div>
        )}
        <button type="submit" style={styles.submitButton}>Añadir Contacto</button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '16px',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '16px',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '16px',
    minHeight: '100px',
  },
  buttonContainer: {
    marginBottom: '15px',
  },
  toggleButton: {
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s',
  },
  status: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#e7f1ff',
    borderRadius: '4px',
    color: '#0056b3',
    fontSize: '14px',
  },
  success: { // Nuevo estilo para el mensaje de éxito
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#d4edda',
    borderRadius: '4px',
    color: '#155724',
    fontSize: '14px',
  },
  error: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#fdd',
    borderRadius: '4px',
    color: '#d00',
    fontSize: '14px',
  },
  submitButton: {
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s',
  },
};

export default AddContact;
