const room = JSON.parse(localStorage.getItem('selectedRoom'));

if (!room) {
  alert('Không có thông tin phòng');
  window.location = 'search.html';
}

roomNumber.innerText = room.roomNumber;
roomType.innerText = room.roomType.name;
showCheckIn.innerText = localStorage.getItem('checkIn');
showCheckOut.innerText = localStorage.getItem('checkOut');

async function bookRoom() {
  const res = await fetch(`${API}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getToken()
    },
    body: JSON.stringify({
      roomId: room.id,
      checkIn: localStorage.getItem('checkIn'),
      checkOut: localStorage.getItem('checkOut')
    })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || 'Đặt phòng thất bại');
    return;
  }

  alert('Đặt phòng thành công');
  window.location = 'my-bookings.html';
}
