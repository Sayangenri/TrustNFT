function submitForm() {
    const userName = document.getElementById('userName').value;
    const userEmail = document.getElementById('userEmail').value;
    const productName = document.getElementById('productName').value;
    const productDetails = document.getElementById('productDetails').value;
  
    fetch('/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userName, userEmail, productName, productDetails })
    })
    .then(response => response.text())
    .then(data => {
      console.log(data); // Log response from backend
      alert('Form submitted successfully!');
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while submitting the form.');
    });
  }