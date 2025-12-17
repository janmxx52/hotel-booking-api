const token = getToken();
const role = localStorage.getItem('role');

if (!token || role !== 'ADMIN') {
  alert('Bạn không có quyền truy cập');
  window.location = 'login.html';
}

async function loadRoomTypes() {
  const res = await fetch(`${API}/rooms/types`);
  const data = await res.json();
  roomType.innerHTML = '';
  data.forEach(rt => {
    roomType.innerHTML += `<option value="${rt.id}">${rt.name}</option>`;
  });
}

async function loadRooms() {
  const res = await fetch(`${API}/rooms`, {
    headers: { Authorization: 'Bearer ' + token }
  });

  const rooms = await res.json();
  roomList.innerHTML = '';

  rooms.forEach(r => {
    roomList.innerHTML += `
      <div class="room">
        <b>${r.roomNumber}</b> |
        ${r.roomType.name} |
        ${r.status}
        <br>
        <button onclick="editRoom(${r.id}, '${r.roomNumber}', ${r.capacity}, ${r.roomTypeId}, '${r.status}')">✏️ Sửa</button>
        <button onclick="disableRoom(${r.id})">🚫 Ngừng</button>
      </div>
    `;
  });
}

async function createRoom() {
  await fetch(`${API}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify({
      roomNumber: roomNumber.value,
      capacity: capacity.value,
      roomTypeId: roomType.value
    })
  });

  resetForm();
  loadRooms();
}

async function updateRoom() {
  await fetch(`${API}/rooms/${roomId.value}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify({
      roomNumber: roomNumber.value,
      capacity: capacity.value,
      roomTypeId: roomType.value,
      status: status.value
    })
  });

  resetForm();
  loadRooms();
}

async function disableRoom(id) {
  if (!confirm('Ngừng sử dụng phòng này?')) return;

  await fetch(`${API}/rooms/${id}/disable`, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer ' + token }
  });

  loadRooms();
}

function editRoom(id, num, cap, typeId, st) {
  roomId.value = id;
  roomNumber.value = num;
  capacity.value = cap;
  roomType.value = typeId;
  status.value = st;

  formTitle.innerText = 'Cập nhật phòng';
  btnCreate.style.display = 'none';
  btnUpdate.style.display = 'inline-block';
  btnCancel.style.display = 'inline-block';
}

function resetForm() {
  roomId.value = '';
  roomNumber.value = '';
  capacity.value = '';
  status.value = 'AVAILABLE';

  formTitle.innerText = 'Thêm phòng mới';
  btnCreate.style.display = 'inline-block';
  btnUpdate.style.display = 'none';
  btnCancel.style.display = 'none';
}

loadRoomTypes();
loadRooms();
