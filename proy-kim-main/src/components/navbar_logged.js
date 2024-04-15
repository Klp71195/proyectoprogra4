import React, { useState, useEffect } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Badge from 'react-bootstrap/Badge'; // Importa Badge para contar notificaciones
import { Bell, PersonFillAdd, Ban, PersonFill } from 'react-bootstrap-icons';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore'; 
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Perfil2 from './perfil2'; // Importa el componente Perfil2

const dropdownTitleStyle = {
  color: 'white',
};

function Navbar_log(props) {
  const [friendRequests, setFriendRequests] = useState([]);
  const [showPerfil, setShowPerfil] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0); // Estado para contar notificaciones
  const [showConfigBox, setShowConfigBox] = useState(false);

  // Función para obtener las solicitudes de amistad pendientes del usuario
  const fetchFriendRequests = async () => {
    try {
      const q = query(collection(db, 'friendRequests'), 
                      where('reciever', '==', props.username),
                      where('stat', '==', 0));
      const querySnapshot = await getDocs(q);
      const requestsList = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setFriendRequests(requestsList);

      // Actualizar el contador de notificaciones
      setNotificationCount(requestsList.length);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  // Función para mostrar u ocultar el cuadro de configuración
  const toggleConfigBox = () => {
    setShowConfigBox(!showConfigBox);
  };
  
  useEffect(() => {
    fetchFriendRequests();
  }, [props.username]);

  // Función para cerrar la sesión del usuario
  const handleLogout = () => {
    window.location.href = '/';
  };

  // Función para aceptar una solicitud de amistad
  const handleAcceptRequest = async (request) => {
    try {
      if (!request.id) {
        console.error('ID de solicitud indefinido');
        return;
      }
      
      const requestRef = doc(db, 'friendRequests', request.id);
      await updateDoc(requestRef, { stat: 1 });

      // Agregar la solicitud a la colección de notificaciones
      await addDoc(collection(db, 'notifications'), {
        type: 'friend_request',
        sender: request.sender,
        receiver: props.username,
        timestamp: new Date()
      });

      fetchFriendRequests();
    } catch (error) {
      console.error('Error al aceptar solicitud de amistad:', error);
    }
  };

  // Función para rechazar una solicitud de amistad
  const handleRejectRequest = async (requestId) => {
    try {
      await deleteDoc(doc(db, 'friendRequests', requestId));
      fetchFriendRequests(); // Actualizar la lista después de eliminar la solicitud
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  // Función para abrir el modal del perfil del usuario
  const openPerfilModal = () => {
    setShowPerfil(true);
  };

  // Función para cerrar el modal del perfil del usuario
  const closePerfilModal = () => {
    setShowPerfil(false);
  };

  return (
    <Navbar bg="dark" data-bs-theme="dark" fixed="top">
      <Container>
        <Navbar.Brand href="#home">PhotoViewer</Navbar.Brand>
        <Navbar.Toggle />
        <NavDropdown 
          title={
            <div>
              <Bell color="white" size={20} style={{ marginRight: '5px' }} />
              {notificationCount > 0 && <Badge bg="danger">{notificationCount}</Badge>} {/* Contador de notificaciones */}
            </div>
          } 
          id="notification-nav-dropdown" 
          style={{ ...dropdownTitleStyle, maxWidth: '300px', minWidth: '200px', whiteSpace: 'normal' }}
        >
          {friendRequests.length === 0 ? (
            <NavDropdown.Item>No hay notificaciones aún</NavDropdown.Item>
          ) : (
            friendRequests.map((request, index) => (
              <NavDropdown.Item key={index}>
                <Card>
                  <Card.Body>
                    {request.sender} te ha enviado una solicitud de conexión
                  </Card.Body>
                  <Card.Footer>
                    <Button variant="success" onClick={() => handleAcceptRequest(request)}>
                      <PersonFillAdd color="white" size={20} />
                    </Button>
                    <Button variant="danger" onClick={() => handleRejectRequest(request.id)}> {/* Agregar manejo para rechazar */}
                      <Ban color="white" size={20} />
                    </Button>
                  </Card.Footer>
                </Card>
              </NavDropdown.Item>
            ))
          )}
        </NavDropdown>
        <Navbar.Collapse className="justify-content-end">
          <Navbar.Text style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ marginRight: '10px' }}></div>
            <NavDropdown title={props.username} id="user-nav-dropdown" style={dropdownTitleStyle}>
              <div className="dropdown-item" onClick={openPerfilModal}>
                {/* Ícono de persona que abre el Perfil2 */}
                <PersonFill color="white" size={20} style={{ marginRight: '5px' }} />
                Ver Perfil
              </div>
              <NavDropdown.Item href="#action/3.2">Interaciones</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>Cerrar sesión</NavDropdown.Item>
            </NavDropdown>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
      {/* Componente de perfil que se muestra cuando se hace clic en el ícono de persona */}
      {showPerfil && <Perfil2 onClose={closePerfilModal} />}
    </Navbar>
  );
}

export default Navbar_log;
