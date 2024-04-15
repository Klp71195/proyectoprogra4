
import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import './sidebar.css';

function Sidebar(props) {
  // Estado para controlar si la barra lateral está expandida o no
  const [isExpanded, setIsExpanded] = useState(false);

  // Función para alternar la expansión de la barra lateral
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  // Elementos de la barra lateral
  const sidebarItems = [
    { title: 'Inicio', link: '#home', icon: 'fas fa-home' },
    { title: 'Conexiones', onClick: props.onFriendsClick, icon: 'fas fa-user-friends' },
    { title: 'Salir', link: '/settings', icon: 'fas fa-cog' }
  ];

  return (
    <div className={`sidebar ${isExpanded ? 'expanded' : ''}`}>
      <button className="toggle-button" onClick={toggleSidebar}>
        <i className={`fas ${isExpanded ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
      </button>
      <Nav defaultActiveKey="/home" className="flex-column">
        {sidebarItems.map((item, index) => (
          <Nav.Link key={index} href={item.link} onClick={item.onClick}>
            <i className={item.icon}></i>
            {item.title}
          </Nav.Link>
        ))}
      </Nav>
    </div>
  );
}

export default Sidebar;
