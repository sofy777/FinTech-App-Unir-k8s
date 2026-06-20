import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = window._env_?.REACT_APP_API_URL || '/api';

function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(false);

  // Formulario nuevo usuario
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    email: '',
    saldo: 0
  });

  // Formulario nueva transacción
  const [nuevaTransaccion, setNuevaTransaccion] = useState({
    tipo: 'ingreso',
    monto: 0,
    descripcion: ''
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/usuarios`);
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
    setLoading(false);
  };

  const crearUsuario = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoUsuario)
      });
      if (response.ok) {
        setNuevoUsuario({ nombre: '', email: '', saldo: 0 });
        cargarUsuarios();
        alert('Usuario creado exitosamente');
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
    }
  };

  const seleccionarUsuario = async (usuario) => {
    setSelectedUser(usuario);
    try {
      const response = await fetch(`${API_URL}/api/usuarios/${usuario.id}/transacciones`);
      const data = await response.json();
      setTransacciones(data);
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
    }
  };

  const crearTransaccion = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      alert('Seleccione un usuario primero');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/transacciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: selectedUser.id,
          ...nuevaTransaccion
        })
      });
      if (response.ok) {
        setNuevaTransaccion({ tipo: 'ingreso', monto: 0, descripcion: '' });
        cargarUsuarios();
        seleccionarUsuario(selectedUser);
        alert('Transacción registrada exitosamente');
      }
    } catch (error) {
      console.error('Error al crear transacción:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>💰 FinTech Solutions S.A.</h1>
        <p>Sistema de Gestión Financiera - Proyecto DevOps</p>
      </header>

      <div className="container">
        <div className="section">
          <h2>👥 Crear Nuevo Usuario</h2>
          <form onSubmit={crearUsuario}>
            <input
              type="text"
              placeholder="Nombre completo"
              value={nuevoUsuario.nombre}
              onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={nuevoUsuario.email}
              onChange={(e) => setNuevoUsuario({...nuevoUsuario, email: e.target.value})}
              required
            />
            <input
              type="number"
              placeholder="Saldo inicial"
              value={nuevoUsuario.saldo}
              onChange={(e) => setNuevoUsuario({...nuevoUsuario, saldo: parseFloat(e.target.value)})}
            />
            <button type="submit">Crear Usuario</button>
          </form>
        </div>

        <div className="section">
          <h2>📋 Lista de Usuarios</h2>
          {loading ? <p>Cargando...</p> : (
            <div className="usuarios-grid">
              {usuarios.map(usuario => (
                <div 
                  key={usuario.id} 
                  className={`usuario-card ${selectedUser?.id === usuario.id ? 'selected' : ''}`}
                  onClick={() => seleccionarUsuario(usuario)}
                >
                  <h3>{usuario.nombre}</h3>
                  <p>📧 {usuario.email}</p>
                  <p className="saldo">💵 ${parseFloat(usuario.saldo).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedUser && (
          <>
            <div className="section">
              <h2>💳 Nueva Transacción para {selectedUser.nombre}</h2>
              <form onSubmit={crearTransaccion}>
                <select
                  value={nuevaTransaccion.tipo}
                  onChange={(e) => setNuevaTransaccion({...nuevaTransaccion, tipo: e.target.value})}
                >
                  <option value="ingreso">Ingreso</option>
                  <option value="egreso">Egreso</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Monto"
                  value={nuevaTransaccion.monto}
                  onChange={(e) => setNuevaTransaccion({...nuevaTransaccion, monto: parseFloat(e.target.value)})}
                  required
                />
                <input
                  type="text"
                  placeholder="Descripción"
                  value={nuevaTransaccion.descripcion}
                  onChange={(e) => setNuevaTransaccion({...nuevaTransaccion, descripcion: e.target.value})}
                  required
                />
                <button type="submit">Registrar Transacción</button>
              </form>
            </div>

            <div className="section">
              <h2>📊 Historial de Transacciones</h2>
              <div className="transacciones-list">
                {transacciones.length === 0 ? (
                  <p>No hay transacciones registradas</p>
                ) : (
                  transacciones.map(trans => (
                    <div key={trans.id} className={`transaccion ${trans.tipo}`}>
                      <span className="tipo">{trans.tipo === 'ingreso' ? '↑' : '↓'} {trans.tipo.toUpperCase()}</span>
                      <span className="monto">${parseFloat(trans.monto).toFixed(2)}</span>
                      <span className="descripcion">{trans.descripcion}</span>
                      <span className="fecha">{new Date(trans.fecha).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <footer>
        <p>Desarrollado por TechOps Solutions | Proyecto DevOps 2025</p>
      </footer>
    </div>
  );
}

export default App;
