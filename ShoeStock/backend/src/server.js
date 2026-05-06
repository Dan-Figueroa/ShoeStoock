const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const conectarDB = require('./config/db');

const zapatoRoutes = require('./routes/zapatoRoutes');
const sucursalRoutes = require('./routes/sucursalRoutes');
const indicadorRoutes = require('./routes/indicadorRoutes');
const metricaRoutes = require('./routes/metricaRoutes');
const ventaRoutes = require('./routes/ventaRoutes');

dotenv.config();

const app = express();

// Conectar a MongoDB
conectarDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API de ShoeStock funcionando correctamente',
  });
});

// Rutas del sistema
app.use('/api/zapatos', zapatoRoutes);
app.use('/api/sucursales', sucursalRoutes);
app.use('/api/indicadores', indicadorRoutes);
app.use('/api/metricas', metricaRoutes);
app.use('/api/ventas', ventaRoutes);

// Puerto del servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});