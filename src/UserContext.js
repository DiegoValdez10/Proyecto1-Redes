import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [xmppClient, setXmppClient] = useState(null);
  const [contacts, setContacts] = useState([]);

  const login = (username, password, client) => {
    setUser({ username, password });
    setIsConnected(true);
    setXmppClient(client);
    console.log('Usuario conectado y cliente XMPP guardado');
  };

  const logout = () => {
    setUser(null);
    setIsConnected(false);
    setXmppClient(null);
    setContacts([]);
    console.log('🔴 Usuario desconectado');
  };

  const updateContacts = (updater) => {
    setContacts(typeof updater === 'function' ? updater(contacts) : updater);
    // Aquí podrías también guardar la lista actualizada en el almacenamiento local o en el servidor
  };

  return (
    <UserContext.Provider value={{ user, isConnected, login, logout, xmppClient, contacts, updateContacts }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}