document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('medicine-form');
  const nameInput = document.getElementById('med-name');
  const priceInput = document.getElementById('med-price');
  const submitBtn = document.getElementById('submit-btn');
  const messageEl = document.getElementById('form-message');
  const medicineListEl = document.getElementById('medicine-list');
  const avgValEl = document.getElementById('avg-val');

  function showMessage(text, type = 'info') {
    if (!messageEl) return;
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
  }

  function safeText(value, fallback = '—') {
    if (value === null || value === undefined) return fallback;
    return String(value);
  }

  async function loadAverage() {
    try {
      const res = await fetch('http://localhost:8000/medicines/average', { cache: 'no-store' });
      if (!res.ok) {
        avgValEl.textContent = 'N/A';
        return;
      }
      const data = await res.json();
      if (data && typeof data.average === 'number') {
        setAverageDisplay(data.average);
      } else {
        avgValEl.textContent = 'N/A';
      }
    } catch (err) {
      avgValEl.textContent = 'N/A';
      console.error('Error loading average:', err);
    }
  }

  function setAverageDisplay(avg) {
    if (avg === null || avg === undefined) {
      avgValEl.textContent = 'N/A';
      return;
    }
    // Ensure numeric and format to two decimals
    const n = Number(avg);
    if (!Number.isFinite(n)) {
      avgValEl.textContent = 'N/A';
      return;
    }
    avgValEl.textContent = n.toFixed(2);
  }

  async function loadMedicines() {
    medicineListEl.innerHTML = '';
    try {
      const res = await fetch('http://localhost:8000/medicines', { cache: 'no-store' });
      if (!res.ok) {
        showMessage('Could not fetch medicines from server.', 'error');
        return;
      }
      const data = await res.json();
      const meds = data && Array.isArray(data.medicines) ? data.medicines : [];

      if (meds.length === 0) {
        medicineListEl.innerHTML = '<p>No medicines available.</p>';
      } else {
        meds.forEach((med) => {
          const name = med && med.name ? med.name : 'Unknown';
          const price = (med && typeof med.price === 'number') ? med.price.toFixed(2) : (med && typeof med.price === 'string' ? med.price : 'N/A');
          const item = document.createElement('div');
          item.className = 'medicine-item';
          item.dataset.name = name;

          // content
          const content = document.createElement('div');
          content.className = 'medicine-content';
          content.innerHTML = `<strong class="med-name">${safeText(name)}</strong> — <span class="price">${safeText(price)}</span>`;

          // actions
          const actions = document.createElement('div');
          actions.className = 'item-actions';

          const editBtn = document.createElement('button');
          editBtn.type = 'button';
          editBtn.className = 'btn btn-edit';
          editBtn.textContent = 'Edit';
          editBtn.addEventListener('click', () => startEdit(item, med));

          const delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.className = 'btn btn-delete';
          delBtn.textContent = 'Delete';
          delBtn.addEventListener('click', () => deleteMed(name));

          actions.appendChild(editBtn);
          actions.appendChild(delBtn);

          item.appendChild(content);
          item.appendChild(actions);
          medicineListEl.appendChild(item);
        });
      }
    } catch (err) {
      showMessage('Could not reach the server. Is the backend running?', 'error');
      console.error(err);
    } finally {
      await loadAverage();
    }
  }

  // Delete a medicine by name
  async function deleteMed(name) {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const formData = new URLSearchParams();
      formData.append('name', name);
      const res = await fetch('http://localhost:8000/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showMessage(data.message || 'Deleted.', 'success');
        // If backend returned the new average, use it immediately to avoid an extra round-trip
        if (data && typeof data.average === 'number') {
          setAverageDisplay(data.average);
        }
        await loadMedicines();
        // Only fetch the average if backend didn't provide it
        if (!(data && typeof data.average === 'number')) await loadAverage();
      } else {
        showMessage(data.error || 'Delete failed', 'error');
      }
    } catch (err) {
      showMessage('Could not reach server for delete.', 'error');
      console.error(err);
    }
  }

  // Start editing a medicine inline
  function startEdit(itemEl, med) {
    const name = med.name || '';
    const priceVal = (med && typeof med.price === 'number') ? med.price : (med && typeof med.price === 'string' ? med.price : '');
    const content = itemEl.querySelector('.medicine-content');
    content.innerHTML = '';

    const nameEl = document.createElement('div');
    nameEl.innerHTML = `<strong>${safeText(name)}</strong>`;

    const input = document.createElement('input');
    input.type = 'number';
    input.min = 0;
    input.step = '0.01';
    input.value = priceVal !== null && priceVal !== undefined ? priceVal : '';
    input.className = 'edit-price';

    content.appendChild(nameEl);
    content.appendChild(input);

    const actions = itemEl.querySelector('.item-actions');
    actions.innerHTML = '';

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn btn-save';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', async () => {
      const newPrice = input.value;
      if (newPrice === '' || Number(newPrice) < 0) {
        showMessage('Enter a valid non-negative price.', 'error');
        return;
      }
      try {
        const formData = new URLSearchParams();
        formData.append('name', name);
        formData.append('price', String(Number(newPrice)));
        const res = await fetch('http://localhost:8000/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
          cache: 'no-store',
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          showMessage(data.message || 'Updated', 'success');
          if (data && typeof data.average === 'number') {
            setAverageDisplay(data.average);
          }
          await loadMedicines();
          if (!(data && typeof data.average === 'number')) await loadAverage();
        } else {
          showMessage(data.error || 'Update failed', 'error');
        }
      } catch (err) {
        showMessage('Could not reach server for update.', 'error');
        console.error(err);
      }
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => loadMedicines());

    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    const name = nameInput.value.trim();
    const price = priceInput.value;
    if (!name) {
      showMessage('Please enter a medicine name.', 'error');
      nameInput.focus();
      return;
    }
    if (price === '' || Number(price) < 0) {
      showMessage('Please enter a valid non-negative price.', 'error');
      priceInput.focus();
      return;
    }

    submitBtn.disabled = true;
    showMessage('Submitting...', 'info');

    try {
      const formData = new URLSearchParams();
      formData.append('name', name);
      formData.append('price', String(Number(price)));

      const res = await fetch('http://localhost:8000/create', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString(),
        cache: 'no-store',
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showMessage(data.message || 'Created successfully.', 'success');
        form.reset();
        if (data && typeof data.average === 'number') {
          setAverageDisplay(data.average);
        }
        await loadMedicines();
        if (!(data && typeof data.average === 'number')) await loadAverage();
      } else {
        showMessage(data.error || 'An error occurred.', 'error');
      }
    } catch (err) {
      showMessage('Could not reach the server. Is the backend running?', 'error');
      console.error(err);
    } finally {
      submitBtn.disabled = false;
    }
  });

  // Initial load: fetch average first to ensure it appears quickly,
  // then load the medicines list. This helps rule out load-order
  // or caching issues where the average may be overwritten.
  await loadAverage();
  loadMedicines();
});
