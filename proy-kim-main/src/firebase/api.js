import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from './config';
import { storage } from './config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Card } from 'react-bootstrap';
import { HeartFill } from 'react-bootstrap-icons';
import { ChatLeftText } from 'react-bootstrap-icons';
import { SendFill } from 'react-bootstrap-icons';
import Form from 'react-bootstrap/Form';
import { Modal } from 'react-bootstrap';
import moment from 'moment';

export const sendFriendRequest = async (reciever, sender, stat) => {
  try {
    const docRef = await addDoc(collection(db, 'friendRequests'),{
      reciever: reciever,
      sender: sender,
      stat: 0
    })
    console.log('Documento con ID:', docRef.id, 'agregado correctamente');
    return docRef.id;
  } catch(error) {
    console.error('Error al agregar documento:', error);
    throw error;
  }
}

export const saveUserData = async (username, email, password, profilePicture) => {
  try {
    const storageRef = ref(storage, `profilePictures/${email}/${username}_pp`);
    await uploadBytes(storageRef, profilePicture);
    const profilePictureURL = await getDownloadURL(storageRef);
    const docRef = await addDoc(collection(db, 'users'), {
      username: username,
      email: email,
      password: password,
      profilePictureURL: profilePictureURL
    });
    console.log('Documento con ID:', docRef.id, 'agregado correctamente');
    return docRef.id;
  } catch (error) {
    console.error('Error al agregar documento:', error);
    throw error;
  }
};

export const findUserByEmail = async (email) => {
  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    } else {
      const data = querySnapshot.docs[0].data();
      return data;
    }
  } catch (error) {
    console.error('Error al buscar el usuario:', error);
    throw error;
  }
};

export const userPost = async (username, email, postPicture, description) => {
  try {
    const postId = generateUniqueId(); // Generar un ID único para la publicación
    const date = new Date();
    const postDate = moment(date).format('MMMM Do YYYY, h:mm:ss a');
    const storageRef = ref(storage, `usersPost/${email}/${username}/${date}_post`);
    await uploadBytes(storageRef, postPicture);
    const postPictureURL = await getDownloadURL(storageRef);
    const docRef = await addDoc(collection(db, 'posts'), {
      id: postId, // Agregar el ID único al documento
      username: username,
      email: email,
      postPictureURL: postPictureURL,
      description: description,
      postDate: postDate
    });
    return postId; // Devolver el ID único de la publicación
  } catch (error) {
    throw error;
  }
};

const generateUniqueId = () => {
  return '_' + Math.random().toString(36).substr(2, 9);
};

export function PostList({ refresh, currentUser }) {
  const [posts, setPosts] = useState([]);
  const [likesCounts, setLikesCounts] = useState({});
  const [userLikedPosts, setUserLikedPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [commentsCount, setCommentsCount] = useState({}); // Agregar estado para almacenar el contador de comentarios
  const [showModal, setShowModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null); // Agregar estado para almacenar el ID de la publicación seleccionada
  const [currentUserData, setCurrentUserData] = useState(null); // Agregar estado para almacenar la información del usuario actual

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = await findUserByEmail(currentUser);
        setCurrentUserData(userData);
      } catch (error) {
        console.error('Error fetching current user data: ', error);
      }
    };
    fetchCurrentUser();
  }, [currentUser]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'posts'));
        const postList = [];
        querySnapshot.forEach((doc) => {
          const post = {
            id: doc.id,
            ...doc.data()
          };
          postList.push(post);
        });
        postList.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
        setPosts(postList);
      } catch (error) {
        console.error('Error fetching posts: ', error);
      }
    };
    fetchPosts();
  }, [refresh]);

  const fetchPostLikes = async (postId) => {
    try {
      const postLikesQuery = query(collection(db, 'postLikes'), where('postId', '==', postId));
      const postLikesSnapshot = await getDocs(postLikesQuery);
      return postLikesSnapshot.size;
    } catch (error) {
      console.error('Error fetching post likes: ', error);
      return 0;
    }
  };

  const fetchUserLikedPosts = async () => {
    try {
      const userLikedPostsQuery = query(collection(db, 'postLikes'), where('userId', '==', currentUser));
      const userLikedPostsSnapshot = await getDocs(userLikedPostsQuery);
      const likedPosts = userLikedPostsSnapshot.docs.map((doc) => doc.data().postId);
      setUserLikedPosts(likedPosts);
    } catch (error) {
      console.error('Error fetching user liked posts: ', error);
    }
  };

  const fetchCurrentUserPosts = async () => {
    try {
      if (!currentUserData) return []; // Retorna un array vacío si no hay información del usuario actual
      const querySnapshot = await getDocs(collection(db, 'posts'));
      const userPosts = [];
      querySnapshot.forEach((doc) => {
        const post = {
          id: doc.id,
          ...doc.data()
        };
        if (post.username === currentUserData.username) { // Filtra solo las publicaciones del usuario actual
          userPosts.push(post);
        }
      });
      userPosts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));
      return userPosts;
    } catch (error) {
      console.error('Error fetching user posts: ', error);
      return [];
    }
  };

  const fetchCommentsForPost = async (postId) => {
    try {
      const commentsQuery = query(collection(db, 'comments'), where('postId', '==', postId));
      const commentsSnapshot = await getDocs(commentsQuery);
      const commentsData = await Promise.all(commentsSnapshot.docs.map(async (doc) => {
        const commentData = doc.data();
        const userData = await findUserByEmail(commentData.userId); // Obtener los datos del usuario que hizo el comentario
        const userProfilePictureURL = userData ? userData.profilePictureURL : ''; // Obtener la URL de la foto de perfil del usuario
        return {
          id: doc.id,
          userProfilePictureURL: userProfilePictureURL, // Incluir la URL de la foto de perfil
          ...commentData
        };
      }));
      const commentsCount = commentsSnapshot.size; // Obtener el número de comentarios
      setCommentsCount((prevCommentsCount) => ({
        ...prevCommentsCount,
        [postId]: commentsCount
      }));
      return commentsData;
    } catch (error) {
      console.error('Error fetching comments: ', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchLikesCounts = async () => {
      const likesCounts = {};
      await Promise.all(
        posts.map(async (post) => {
          const likesCount = await fetchPostLikes(post.id);
          likesCounts[post.id] = likesCount;
        })
      );
      setLikesCounts(likesCounts);
    };

    fetchLikesCounts();
    fetchUserLikedPosts();
  }, [posts, currentUser]);

  useEffect(() => {
    const fetchComments = async () => {
      if (selectedPostId) {
        const commentsMap = {};
        const postComments = await fetchCommentsForPost(selectedPostId);
        commentsMap[selectedPostId] = postComments;
        setComments(commentsMap);
      }
    };

    fetchComments();
  }, [selectedPostId]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      const userPosts = await fetchCurrentUserPosts();
      setPosts(userPosts);
    };
    fetchUserPosts();
  }, [refresh, currentUserData]);

  const handleLikeClick = async (postId) => {
    try {
      if (userLikedPosts.includes(postId)) {
        console.log('El usuario ya le dio like a este post');
        return;
      }

      await addDoc(collection(db, 'postLikes'), {
        userId: currentUser,
        postId: postId
      });

      const updatedLikesCount = await fetchPostLikes(postId);
      setLikesCounts((prevLikesCounts) => ({
        ...prevLikesCounts,
        [postId]: updatedLikesCount
      }));
      setUserLikedPosts((prevUserLikedPosts) => [...prevUserLikedPosts, postId]);
    } catch (error) {
      console.error('Error al dar like al post: ', error);
    }
  };

  const handleChatClick = (postId) => {
    setSelectedPostId(postId);
    setShowModal(true);
  };

  const handleCommentTextChange = (event) => {
    setCommentText(event.target.value);
  };

  const handleSendComment = async (postId) => {
    try {
      await addDoc(collection(db, 'comments'), {
        postId: postId,
        userId: currentUser,
        username: currentUser,
        comment: commentText,
        timestamp: new Date()
      });
      console.log('Comentario agregado correctamente.');
      setCommentText('');
  
      // Obtener los comentarios actualizados para la publicación
      const updatedComments = await fetchCommentsForPost(postId);
      // Actualizar el estado de los comentarios con los comentarios actualizados
      setComments((prevComments) => ({
        ...prevComments,
        [postId]: updatedComments
      }));
    } catch (error) {
      console.error('Error al enviar el comentario: ', error);
    }
  };
  
  

  return (
    <div className="post-list">
      {posts.map((post) => (
        <div key={post.id} style={{ marginBottom: '20px' }}>
          <br />
          <div className="card" style={{ width: '80%' }}>
            <Card.Header>
              <img
                alt=""
                src={`https://firebasestorage.googleapis.com/v0/b/db-proykim.appspot.com/o/profilePictures%2F${post.email}%2F${post.username}_pp?alt=media`}
                width="30"
                height="30"
                style={{ borderRadius: '100%', display: 'inline-block' }}
                className="d-inline-block align-top"
              />
              <h5 className="card-title" style={{ display: 'inline-block', marginLeft: '10px' }}>{post.username}</h5>
            </Card.Header>
            <div className="card-body">
              <p>{post.description}</p>
              <img src={post.postPictureURL} className="card-img-top" alt="Post" />
            </div>
            <Card.Footer>
              <HeartFill
                color={userLikedPosts.includes(post.id) ? 'red' : 'gray'}
                size={20}
                onClick={() => handleLikeClick(post.id)}
                style={{ cursor: 'pointer', marginRight: '10px' }}
              /> {likesCounts[post.id]} Likes      
              <ChatLeftText color='gray'                 
                size={20}
                onClick={() => handleChatClick(post.id)}
                style={{ cursor: 'pointer', marginLeft: '20px'}}/>
              <span style={{ marginLeft: '10px' }}>{commentsCount[post.id] || 0} Comentarios</span> {/* Mostrar el contador de comentarios */}
            </Card.Footer>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Escribe o lee comentarios:</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Card>
                  <Form>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                      <Form.Label>Escribe tu comentario</Form.Label>
                      <Form.Control 
                        type="text" 
                        placeholder="" 
                        value={commentText} 
                        onChange={handleCommentTextChange} 
                      />
                      <br></br>
                      <Form.Text className="text-muted">
                        Por favor se respetuoso
                      </Form.Text>
                      <SendFill
                        color='green'                 
                        size={20}
                        onClick={() => handleSendComment(selectedPostId)}
                        style={{ cursor: 'pointer', marginLeft: '20px'}}
                      />
                    </Form.Group>
                  </Form>
                </Card>
                <br></br>
                <Card>
                  <div>
                    <h6>Comentarios:</h6>
                    {comments[selectedPostId] && comments[selectedPostId].map((comment, index) => (
                      <div key={index}>
                        <p><strong>{comment.username}: </strong>{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </Modal.Body>
            </Modal>
          </div>
        </div>
      ))}
    </div>
  );
}
