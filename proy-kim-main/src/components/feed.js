import React, { useState, useEffect } from 'react'; 
import Card from 'react-bootstrap/Card'; 
import { Form, Button } from 'react-bootstrap'; 
import { userPost } from '../firebase/api'; 
import { PostList } from '../firebase/api'; 
import Sidebar from './sidebar'; 
import FriendsOffcanvas from './friendsoffcanvas'; 
import './feed.css'; 

function Feed(props) { 
  const [postPicture, setPostPicture] = useState(null); 
  const [description, setDescription] = useState(''); 
  const [refreshPosts, setRefreshPosts] = useState(false); 
  const [showFriendsOffcanvas, setShowFriendsOffcanvas] = useState(false); 
  const [isPosting, setIsPosting] = useState(false); 

  const handleFriendsClick = () => { // Define la función handleFriendsClick
    setShowFriendsOffcanvas(true); 
  };

  const handlePostSubmit = async (e) => { // Define la función handlePostSubmit
    e.preventDefault(); // Evita el comportamiento predeterminado del formulario
    setIsPosting(true); 
    try {
      if (!postPicture) { // Si no hay una imagen seleccionada
        throw new Error('Por favor, seleccione una imagen.'); // Lanza un error
      }
      const username = props.username; // Obtiene el nombre de usuario de props
      const email = props.userEmail; // Obtiene el correo electrónico de usuario de props
      await userPost(username, email, postPicture, description); 
      console.log('La imagen se ha publicado correctamente.'); 
      setPostPicture(null); 
      setRefreshPosts(true);
    } catch (error) { 
      console.error('Error al publicar: ', error); 
    } finally {
      setIsPosting(false); // Establece isPosting como false independientemente del resultado
    }
  };

  const handleFileChange = (e) => { // Define la función handleFileChange
    const file = e.target.files[0]; // Obtiene el archivo seleccionado del evento
    setPostPicture(file); // Establece el estado de la imagen con el archivo seleccionado
  };

  useEffect(() => { // Define el efecto que se ejecuta cuando cambia refreshPosts o description
    console.log('Efecto de Feed activado.');
    if (refreshPosts) { // Si refreshPosts es true
      console.log('Se ejecutó el efecto de PostList debido a un cambio en refresh'); // Registra en la consola que se ejecutó el efecto de PostList debido a un cambio en refresh
      setRefreshPosts(true); // Establece refreshPosts como true (esto parece innecesario y puede ser un error)
      console.log('SetrefreshTrue'); // Registra en la consola que se estableció refresh como true
    }
  }, [refreshPosts, description]); 

  return ( // Retorna la estructura JSX del componente Feed
    <div className="container-fluid" id="home"> {}
      <div className="row"> {}
        <div className="col-md-2"> {}
          <Sidebar onFriendsClick={handleFriendsClick} /> {}
        </div>
        <div className="col-md-10"> {}
          <br /> {}
          <br /> {}
          <br /> {}
          <div className="feed"> {}
            <Card className="post-form"> {}
              <Card.Header>Publica una imagen especial</Card.Header> {}
              <Card.Body> {}
                <Form onSubmit={handlePostSubmit}> {}
                  <Form.Group controlId="formBasicDescription"> {}
                    <Form.Control type="text" placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} /> {}
                  </Form.Group>
                  <Form.Group controlId="formBasicProfilePicture"> {}
                    <Form.Control type="file" accept="image/*" onChange={handleFileChange} /> {}
                    <Form.Text className="text-muted">Seleccione una imagen para publicar.</Form.Text> {}
                  </Form.Group>
                  <Button variant="primary" type="submit" disabled={isPosting}> {}
                    {isPosting ? 'Publicando...' : 'Publicar'} {}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
            <br /> {}
            <br /> {}
            <h4>Publicaciones recientes:</h4> {}
            <PostList refresh={refreshPosts} currentUser={props.username} /> {}
          </div>
        </div>
      </div>
      <FriendsOffcanvas show={showFriendsOffcanvas} onHide={() => setShowFriendsOffcanvas(false)} username={props.username} /> {}
    </div>
  );
}

export default Feed;
