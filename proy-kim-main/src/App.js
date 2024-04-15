import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import MyNavbar from './components/navbar';
import Navbar_log from './components/navbar_logged';
import Perfil2 from './components/perfil2';
import Feed from './components/feed';
import { saveUserData, findUserByEmail } from './firebase/api';
import sha256 from 'crypto-js/sha256';
import { useHistory } from 'react-router-dom'; 

function App() {
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationError, setRegistrationError] = useState(false);
  const [passwordsMatchError, setPasswordsMatchError] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState(false);

// Función para alternar la visibilidad del formulario de inicio de sesión y ocultar el formulario de registro
const toggleLoginForm = () => {
  setShowLoginForm(!showLoginForm); // Cambia el estado de visibilidad del formulario de inicio de sesión
  setShowRegisterForm(false); // Oculta el formulario de registro
};

// Función para alternar la visibilidad del formulario de registro y ocultar el formulario de inicio de sesión
const toggleRegisterForm = () => {
  setShowRegisterForm(!showRegisterForm); // Cambia el estado de visibilidad del formulario de registro
  setShowLoginForm(false); // Oculta el formulario de inicio de sesión
};

// Estado para almacenar los datos del usuario y la función para establecerlo
const [userData, setUserData] = useState(null);

// Función para manejar el envío del formulario de inicio de sesión
const handleLoginSubmit = async (e) => {
  e.preventDefault();
  const email = e.target.elements.formBasicEmail.value; 
  const password = e.target.elements.formBasicPassword.value; 
  try {
    // Busca los datos del usuario por correo electrónico en la base de datos
    const userData = await findUserByEmail(email);
    if(userData) { 
      setUserData(userData); 
      if(sha256(password).toString() === userData.password) { 
        console.log("Logged in successfully"); 
        setUserAuthenticated(true);
        toggleLoginForm(); 
      } else {
        console.log("Logged in unsuccessfully");
      }
    } else {
      console.log("No such user found"); 
    }
  } catch(error) {

  }
};

// Función para manejar el envío del formulario de registro
const handleRegistrationSubmit = async (e) => {
  e.preventDefault(); 

    // Aquí obtén los valores del formulario, incluida la foto de perfil
    const username = e.target.elements.formBasicName.value;
    const email = e.target.elements.formBasicEmail.value;
    const password = e.target.elements.formBasicPassword.value;
    const confirmPassword = e.target.elements.formBasicPasswordConfirmation.value;
    const profilePicture = e.target.elements.formBasicProfilePicture.files[0]; // Obtiene el archivo de la foto de perfil
    

    // Verificar si las contraseñas coinciden
    if (password === confirmPassword) {
      try {
        // Guardar los datos del usuario, incluida la foto de perfil
        const userData = await saveUserData(username, email, sha256(password).toString(), profilePicture);
        setRegistrationSuccess(true);
        setRegistrationError(false);
        toggleLoginForm();
        setTimeout(() => {
          setRegistrationSuccess(false);
        }, 5000); // Ocultar la alerta de éxito después de 5 segundos
      } catch (error) {
        setRegistrationSuccess(false);
        setRegistrationError(true);
        console.error('Error al guardar los datos en Firebase Firestore:', error);
        setTimeout(() => {
          setRegistrationError(false);
        }, 5000); // Ocultar la alerta de error después de 5 segundos
      }
    } else {
      // Mostrar la alerta de contraseñas no coincidentes
      setPasswordsMatchError(true);
      setTimeout(() => {
        setPasswordsMatchError(false);
      }, 5000); // Ocultar la alerta de error después de 5 segundos
    }
};

  return (
    <div>
      {userAuthenticated && <Navbar_log username={userData.username}  userEmail = {userData.email}/>}
      {!userAuthenticated && <MyNavbar/>}
      <Container className="mt-5">
        {registrationSuccess && (
          <Alert variant="success">
            La cuenta se ha creado correctamente, intente iniciar sesión!
          </Alert>
        )}
        {registrationError && (
          <Alert variant="danger">
            La cuenta no se pudo crear, intente nuevamente!
          </Alert>
        )}

        {showLoginForm && (
          <Row className="justify-content-md-center">
            <Col md="6">
              <h2>Iniciar sesión</h2>
              <Form onSubmit={handleLoginSubmit}>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control type="email" placeholder="Ingrese su correo electrónico" />
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control type="password" placeholder="Ingrese su contraseña" />
                </Form.Group>
                <br></br>
                <Button variant="primary" type="submit">
                  Iniciar sesión
                </Button>
              </Form>
              <p className="mt-3 text-center">
                ¿No tienes una cuenta? <a href="#" onClick={toggleRegisterForm}>Crear una cuenta</a>
              </p>
            </Col>
          </Row>
        )}

        {showRegisterForm && (
          <Row className="mt-3 justify-content-md-center">
            <Col md="6">
              <h2>Crear una cuenta</h2>
              <Form onSubmit={handleRegistrationSubmit}>
                <Form.Group controlId="formBasicName">
                  <Form.Label>Nombre de usuario</Form.Label>
                  <Form.Control type="text" placeholder="Ingrese su nombre de usuario" />
                </Form.Group>

                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control type="email" placeholder="Ingrese su correo electrónico" />
                </Form.Group>

                <Form.Group controlId="formBasicPassword">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control type="password" placeholder="Ingrese su contraseña" />
                </Form.Group>

                <Form.Group controlId="formBasicPasswordConfirmation">
                  <Form.Label>Repetir contraseña</Form.Label>
                  <Form.Control type="password" placeholder="Repita su contraseña" />
                  {passwordsMatchError && (
                  <Alert variant="warning">
                    Las contraseñas no coinciden, intenta nuevamente!
                  </Alert>
                  )}
                </Form.Group>
                <Form.Group controlId="formBasicProfilePicture">
                  <Form.Label>Foto de perfil</Form.Label>
                  <Form.Control type="file" accept="image/*" />
                  <Form.Text className="text-muted">
                  Seleccione una imagen para su foto de perfil.
                  </Form.Text>
                </Form.Group>
                <br></br>
                <Button variant="primary" type="submit" >
                  Registrarse
                </Button>
              </Form>
              <p className="mt-3 text-center">¿Ya tienes una cuenta? <a href="#" onClick={toggleLoginForm}>Iniciar sesión</a></p>
            </Col>
          </Row>
        )}
      
      {userAuthenticated && <Feed username={userData.username}  userEmail = {userData.email}/>}
      </Container>
    </div>
  );
}

export default App;
