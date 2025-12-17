const API = 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('token');
}

function logout() {
  localStorage.clear();
  alert('Đã đăng xuất');
  window.location = 'login.html';
}
