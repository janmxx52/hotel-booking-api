document.addEventListener('DOMContentLoaded', loadMyBookings);

async function loadMyBookings() {
  const bookingListEl = document.getElementById('bookingList');
  const token = localStorage.getItem('token');

  if (!token) {
    bookingListEl.innerHTML = '<p>Vui lòng đăng nhập</p>';
    return;
  }

  const res = await fetch('http://localhost:3000/api/bookings/my', {
    headers: {
      Authorization: 'Bearer ' + token
    }
  });

  const data = await res.json();
  bookingListEl.innerHTML = '';

  if (!Array.isArray(data) || data.length === 0) {
    bookingListEl.innerHTML = '<p>Bạn chưa có đơn đặt phòng nào</p>';
    return;
  }

  data.forEach(b => {
    bookingListEl.innerHTML += `
      <div class="room">
        <b>Phòng:</b> ${b.room.roomNumber}<br>
        <b>Loại phòng:</b> ${b.room.roomType.name}<br>
        <b>Check-in:</b> ${formatDate(b.checkIn)}<br>
        <b>Check-out:</b> ${formatDate(b.checkOut)}<br>
        <b>Trạng thái:</b> ${b.status}<br>

        ${
          b.status !== 'CANCELLED'
            ? `<button onclick="cancelBooking(${b.id})">❌ Hủy đặt phòng</button>`
            : `<i>Đã hủy</i>`
        }
      </div>
    `;
  });
}

// Hủy booking
async function cancelBooking(bookingId) {
  const token = localStorage.getItem('token');

  if (!confirm('Bạn chắc chắn muốn hủy đặt phòng này?')) return;

  const res = await fetch(
    `http://localhost:3000/api/bookings/${bookingId}/cancel`,
    {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer ' + token
      }
    }
  );

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || 'Không thể hủy đặt phòng');
    return;
  }

  alert('Hủy đặt phòng thành công');
  loadMyBookings(); // reload lại danh sách
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('vi-VN');
}
