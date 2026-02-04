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

            if (packageType === "Fiesta de gallos") {
                openCalculatorModal(packageType);
            } else {
                scrollToContact(packageType);
            }
        });
    });

    setupCalculator();
}

function scrollToContact(packageType, details = "") {
    const messageArea = document.getElementById('message');

    if (details) {
        messageArea.value = details;
    } else {
        messageArea.value = `Hola, estoy interesado en cotizar el paquete "${packageType}".`;
    }

    document.querySelector('#contacto').scrollIntoView({ behavior: 'smooth' });
}

// Calculator Logic
const modal = document.getElementById("calculator-modal");
const closeBtn = document.querySelector(".close-modal");
const personInput = document.getElementById("person-count");
const priceResult = document.getElementById("price-result");
const pricePerPersonEl = document.getElementById("price-per-person");
const totalPriceEl = document.getElementById("total-price");
const continueBtn = document.getElementById("btn-continue-contact");

let currentPackage = "";

function openCalculatorModal(packageType) {
    currentPackage = packageType;
    modal.classList.add("show");
    personInput.value = "";
    priceResult.classList.add("hidden");
    continueBtn.disabled = true;
    personInput.focus();
}

function setupCalculator() {
    // Close Modal
    closeBtn.onclick = () => {
        modal.classList.remove("show");
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.classList.remove("show");
        }
    }

    // Input Change
    personInput.addEventListener("input", calculatePrice);

    // Continue Button
    continueBtn.addEventListener("click", () => {
        const count = parseInt(personInput.value);
        const pricing = getPrice(count);

        const details = `Hola, estoy interesado en cotizar el paquete "${currentPackage}".\n\nDetalles del cálculo:\n- Cantidad de personas: ${count}\n- Precio estimado por persona: ¢${pricing.pricePerPerson}\n- Total estimado: ¢${pricing.total}`;

        modal.classList.remove("show");
        scrollToContact(currentPackage, details);
    });
}

function calculatePrice() {
    const count = parseInt(personInput.value);

    if (!count || count <= 0) {
        priceResult.classList.add("hidden");
        continueBtn.disabled = true;
        return;
    }

    const pricing = getPrice(count);

    if (pricing.pricePerPerson === 0) {
        // Handle cases outside of range just in case, though 50-100 covers top end.
        // For now assuming > 100 is same as top tier or quote customized.
        // Let's assume standard behavior for now but maybe warn if out of range?
        // The prompt said: 50 to 100. What about > 100?
        // "if the number of persons is beetwen 21 to 49 calculates the price 7500 colones per person and beetwen 50 to 100 the price 7000 colones per person"
        // It didn't specify > 100. I'll assume 7000 for > 100 or show "Cotizar Especial".
        // Let's stick strictly to prompt ranges for now.

        if (count > 100) {
            pricePerPersonEl.textContent = "Cotizar Especial";
            totalPriceEl.textContent = "Contáctenos";
            priceResult.classList.remove("hidden");
            continueBtn.disabled = false;
            return;
        }
    }

    // Update UI
    pricePerPersonEl.textContent = "¢" + pricing.pricePerPerson.toLocaleString();
    totalPriceEl.textContent = "¢" + pricing.total.toLocaleString();

    priceResult.classList.remove("hidden");
    continueBtn.disabled = false;
}

function getPrice(count) {
    let price = 0;

    // Ranges from prompt:
    // 1 to 20: 8000
    // 21 to 49: 7500
    // 50 to 100: 7000

    if (count >= 1 && count <= 20) {
        price = 8000;
    } else if (count >= 21 && count <= 49) {
        price = 7500;
    } else if (count >= 50) {
        // Covering 50-100 and potentially above with same price or capping?
        // Prompt says "beetwen 50 to 100". 
        // I will apply 7000 for 50+, but maybe add a visual note if > 100 later.
        price = 7000;
    }

    return {
        pricePerPerson: price,
        total: price * count
    };
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
