import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { sendFriendRequest } from '../firebase/api';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { PersonFillAdd, Ban } from 'react-bootstrap-icons';
import './friendsoffcanvas.css';

function FriendsOffcanvas(props) {
  const [key, setKey] = useState('home');
  const [friends, setFriends] = useState([]);
  const [peopleToDiscover, setPeopleToDiscover] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);

 // Función para enviar o rechazar una solicitud de amista
  const handleFriendRequest = async (receiver, reject = false) => {
    const sender = props.username;
    const stat = reject ? 2 : 0; // 2 para rechazado
    try {
      if (!reject) {
        const sent = await sendFriendRequest(receiver, sender, stat);
        if (sent) {
          console.log("Solicitud enviada");
          // Marcar la solicitud como enviada
          const updatedPeopleToDiscover = peopleToDiscover.map(person =>
            person.username === receiver ? { ...person, requestSent: true } : person
          );
          setPeopleToDiscover(updatedPeopleToDiscover);
        } else {
          console.log("Error al enviar la solicitud");
        }
      } else {
        console.log("Solicitud rechazada");
        // Eliminar la persona de la lista
        const updatedPeopleToDiscover = peopleToDiscover.filter(person =>
          person.username !== receiver
        );
        setPeopleToDiscover(updatedPeopleToDiscover);
      }
    } catch (error) {
      console.error('Error sending/rejecting friend request:', error);
    }
  };


   // Función para obtener la lista de amigos del usuario
  const fetchFriends = async () => {
    try {
      const currentUser = props.username;
      const q1 = query(collection(db, 'friendRequests'), 
      where('stat', '==', 1),
      where('receiver', '==', currentUser));

      const q2 = query(collection(db, 'friendRequests'), 
      where('stat', '==', 1),
      where('sender', '==', currentUser));

      const querySnapshot1 = await getDocs(q1);
      const querySnapshot2 = await getDocs(q2);

      const requestsList1 = querySnapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const requestsList2 = querySnapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Combina los resultados de ambas consultas
      const combinedRequestsList = [...requestsList1, ...requestsList2];
      
      console.log(combinedRequestsList)
      setFriends(combinedRequestsList);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };


  // Función para obtener la lista de personas que el usuario puede descubrir
  const fetchPeopleToDiscover = async () => {
    try {
      const currentUser = props.username;
      const q = query(collection(db, 'users'), 
      where('username', '!=', currentUser))
      const usersSnapshot = await getDocs(q);
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), requestSent: false }));

      const peopleToDiscoverList = usersList.filter(user => !friends.some(friend => friend.id === user.id));
      setPeopleToDiscover(peopleToDiscoverList);
    } catch (error) {
      console.error('Error fetching people to discover:', error);
    }
  };


// Función para obtener la lista de solicitudes de amistad del usuario
  const fetchFriendRequests = async () => {
    try {
      const currentUser = props.username;
      console.log(currentUser)
      const q = query(collection(db, 'friendRequests'), 
      where('stat', '==', 1),
      where('reciever', '==', currentUser),
      where('sender', '==', currentUser));
      const querySnapshot = await getDocs(q);
      const requestsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFriendRequests(requestsList);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };


   // Efecto para realizar las consultas de amigos, personas por descubrir y solicitudes de amistad cuando el componente se monta
  useEffect(() => {
    fetchFriends();
    fetchPeopleToDiscover();
    fetchFriendRequests();
  }, []);

  const handleClose = () => {
    if (props.onHide) {
      props.onHide();
    }
  };

  return (
    <Offcanvas show={props.show} onHide={handleClose} className="animated-offcanvas">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Conexiones</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Tabs
          defaultActiveKey="friendships"
          id="controlled-tab-example"
          activeKey={key}
          onSelect={(k) => setKey(k)}
          className="mb-3"
        >
          <Tab eventKey="friendships" title="Tus Amigos">
            {/* Código para mostrar amigos */}
          </Tab>
          <Tab eventKey="discover" title="Personas por descubrir">
            Personas que quizás conozcas:
            <ul className="discover-list">
              {peopleToDiscover.map((person, index) => (
                <div key={index} className="animated-person">
                  <Card>
                    <Card.Body>
                      <img
                        src={`https://firebasestorage.googleapis.com/v0/b/db-proykim.appspot.com/o/profilePictures%2F${person.email}%2F${person.username}_pp?alt=media`}
                        alt={`Foto de perfil de ${person.username}`}
                        className="profile-img"
                      />
                      {person.username}
                    </Card.Body>
                    <Card.Footer>
                      {/* Mostrar el botón "Solicitud enviada" si la persona ya ha sido solicitada */}
                      { !person.requestSent ? (
                        <Button variant="success" onClick={() => handleFriendRequest(person.username)}>
                          Enviar Solicitud
                        </Button>
                      ) : (
                        <Button variant="secondary" disabled>
                          Solicitud Enviada
                        </Button>
                      )}
                      <Button variant="danger" onClick={() => handleFriendRequest(person.username, true)}>
                        Rechazar
                      </Button>
                    </Card.Footer>
                  </Card>
                  <br />
                </div>
              ))}
            </ul>
          </Tab>
        </Tabs>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default FriendsOffcanvas;
