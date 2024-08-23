import React from 'react';
import Register from '../Componentes/Register'; 

function Registro() {
  return (
    <div style={styles.pageContainer}>
      <Register />
    </div>
  );
}

const styles = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100%',
    backgroundColor: '#f4f4f4',
    padding: '20px', // Agrega un poco de espacio alrededor
  },
};

export default Registro;
