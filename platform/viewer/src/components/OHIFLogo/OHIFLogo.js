import './OHIFLogo.css';
import React from 'react';

function logout() {
  console.log('Sesion Finalizada');
  localStorage.removeItem('userData', '');
  localStorage.clear();
  this.setState({ redirectToReferrer: false });
}

function OHIFLogo() {
  return (
    <a
      style={{ textAlign: 'center' }}
      href="/"
      className="logout"
      onClick={logout}
    >
      <img src="/assets/BlueLogo.png" height="50" />| Finalizar Sesión
    </a>
  );
}

export default OHIFLogo;
