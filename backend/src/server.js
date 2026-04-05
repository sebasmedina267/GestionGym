import app from './app.js';
import { config } from './config/env.js';

app.listen(config.port, () => {
  console.log(`FitFlow backend escuchando en puerto ${config.port}`);
});