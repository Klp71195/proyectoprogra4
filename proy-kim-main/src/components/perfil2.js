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

  const handleFriendRequest = async (receive) => {
    console.log(props.username);
    const sender = props.username;
    const receiver = receive;
    const stat = 0;
    try {
      const sent = await sendFriendRequest(receiver, sender, stat);
      if (sent) {
        console.log("Solicitud enviada");
      } else {
        console.log("Error al enviar la solicitud");
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

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

  const fetchPeopleToDiscover = async () => {
    try {
      const currentUser = props.username;
      const q = query(collection(db, 'users'), 
      where('username', '!=', currentUser))
      const usersSnapshot = await getDocs(q);
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const peopleToDiscoverList = usersList.filter(user => !friends.some(friend => friend.id === user.id));
      setPeopleToDiscover(peopleToDiscoverList);
    } catch (error) {
      console.error('Error fetching people to discover:', error);
    }
  };

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

  useEffect(() => {
    fetchFriends();
  }, []);

  useEffect(() => {
    fetchPeopleToDiscover();
  }, [friends]);

  useEffect(() => {
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
          <div className="friendship-container">
          <p className="friendship-text">Estas increíbles personas son tus amigos:</p>
          </div>
            <ul className="friend-list">
              {friends.map((friend, index) => (
                <li key={index} className="animated-friend">
                  <img
                    src={`https://firebasestorage.googleapis.com/v0/b/db-proykim.appspot.com/o/profilePictures%2F${friend.userEmail}%2F${friend.username}_pp?alt=media`}
                    alt={`Foto de perfil de ${friend.username}`}
                    className="profile-img"
                  />
                  {friend.name}
                </li>
              ))}
            </ul>
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
                      <Button variant="success" onClick={() => handleFriendRequest(person.username)}>
                        <PersonFillAdd color="white" size={20} />
                      </Button>
                      <Button variant="danger">
                        <Ban color="white" size={20} />
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