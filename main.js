/* 
  CONFIGURATION
  Replace this URL with your deployed Google Apps Script URL.
*/
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby9W9XWjl4NWW-jXUVSW5EZwN6RYksupHfQ1gYGLQcDJxUEicSRJrNFFL563rf-SHei/exec";

document.addEventListener('DOMContentLoaded', () => {
    setupButtons();
    setupContactForm();
});

function setupButtons() {
    const quoteButtons = document.querySelectorAll('.btn-cotizar');

    quoteButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const packageType = e.target.dataset.package;
            const price = e.target.dataset.price;

            // For a simple "Cotizar" button, we might want to prompt for basic info 
            // or scroll to the contact form and pre-fill it.
            // Here, let's pre-fill the contact form message and scroll to it.

            const messageArea = document.getElementById('message');
            messageArea.value = `Hola, estoy interesado en cotizar el paquete "${packageType}".`;

            document.querySelector('#contacto').scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function setupContactForm() {
    const form = document.getElementById('contact-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Enviando...";
        submitBtn.disabled = true;

        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => data[key] = value);

        // Add service type to the message since there is no dedicated column
        // (implied by content of message, but ensuring it's captured)
        const serviceType = "Consulta Web";
        // We append it only if not already present in the user text to avoid duplication
        if (!data.mensaje.includes("interesado en cotizar")) {
            data.mensaje += ` \n\n[Tipo de Servicio: ${serviceType}]`;
        }

        fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data),
            mode: "no-cors", // Important for Google Apps Script simple triggers
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(() => {
                alert("¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.");
                form.reset();
            })
            .catch(error => {
                console.error('Error:', error);
                alert("Hubo un error al enviar. Por favor intenta de nuevo.");
            })
            .finally(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
    });
}
