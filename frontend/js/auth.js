async function register() {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: fullName.value,
      email: email.value,
      password: password.value
    })
  });

  const data = await res.json();
  alert(data.message || 'Đăng ký thành công');
}

async function login() {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || 'Đăng nhập thất bại');
    return;
  }

  localStorage.setItem('token', data.token);
  localStorage.setItem('role', data.user.role); // lưu role
  alert('Đăng nhập thành công');
  window.location = 'index.html';
}
