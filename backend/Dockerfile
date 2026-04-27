# Imagen base
FROM node:18

# Carpeta de trabajo
WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar deps
RUN npm install

# Copiar código
COPY . .

# Exponer puerto
EXPOSE 3000

# Ejecutar app
CMD ["npm", "run", "dev"]