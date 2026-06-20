FROM node:20-alpine

# Establecer el directorio de trabajo en /app
WORKDIR /app

# Copiar archivos de dependencias (package.json y package-lock.json si existe) primero para aprovechar la caché de capas de Docker.
# Si el código cambia pero las dependencias no, Docker reutiliza la capa de instalación, acelerando las reconstrucciones.
COPY package*.json ./

# Instalar dependencias de producción únicamente
RUN npm install --production

# Copiar el código fuente después de instalar dependencias
# El código fuente cambia más frecuentemente que las dependencias, por lo que se copia al final
# para maximizar el uso de la caché de Docker en reconstrucciones.
COPY . .

# Exponer el puerto 3001
EXPOSE 3001

# Iniciar la aplicación
CMD ["npm", "start"]