/* Browser entry point for the authentication and live chess controller. */
const controller = document.createElement('script');
controller.src = 'app.js';
controller.defer = true;
document.head.appendChild(controller);
