import cors from 'cors';

const opciones = {
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

export default cors(opciones);