async function searchRooms() {
  if (!checkIn.value || !checkOut.value) {
    alert('Vui lòng chọn ngày');
    return;
  }

  const res = await fetch(
    `${API}/rooms/available?checkIn=${checkIn.value}&checkOut=${checkOut.value}`
  );

  if (!res.ok) {
    const text = await res.text();
    console.error(text);
    alert('API tìm phòng lỗi');
    return;
  }

  const data = await res.json();
  result.innerHTML = '';

  if (data.length === 0) {
    result.innerHTML = '<p>Không có phòng trống</p>';
    return;
  }

  data.forEach(r => {
    result.innerHTML += `
      <div class="room">
        <b>${r.roomNumber}</b> - ${r.roomType.name}
        <button onclick='goBooking(${JSON.stringify(r)})'>Đặt</button>
      </div>
    `;
  });
}
function goBooking(room) {
  localStorage.setItem('selectedRoom', JSON.stringify(room));
  localStorage.setItem('checkIn', checkIn.value);
  localStorage.setItem('checkOut', checkOut.value);
  window.location = 'booking.html';
}

