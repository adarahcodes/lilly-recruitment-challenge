document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('medicine-form');
	const nameInput = document.getElementById('name');
	const priceInput = document.getElementById('price');
	const submitBtn = document.getElementById('submit-btn');
	const messageEl = document.getElementById('form-message');

	function showMessage(text, type = 'info') {
		messageEl.textContent = text;
		messageEl.className = `message ${type}`;
	}

	form.addEventListener('submit', async (ev) => {
		ev.preventDefault();

		// Basic client-side validation
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
			// Backend expects form data (FastAPI Form)
			const formData = new URLSearchParams();
			formData.append('name', name);
			formData.append('price', String(Number(price)));

			const res = await fetch('http://localhost:8000/create', {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: formData.toString()
			});

			const data = await res.json();
			if (res.ok) {
				showMessage(data.message || 'Created successfully.', 'success');
				form.reset();
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
});
