import React from 'react';
import Login from '../Componentes/Login';

function Inicio() {
  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <Login /> {}
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', 
  },
  box: {
    width: '50%', 
    height: '50%', 
    backgroundColor: '#fff', 
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
    borderRadius: '8px',
  },
};

export default Inicio;
