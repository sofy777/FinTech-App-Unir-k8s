# React requiere Node.js y npm para el proceso de build.
FROM node:20-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar dependencias primero y aprovechar la caché de Docker para acelerar reconstrucciones cuando solo cambia el código fuente.
COPY package*.json ./

# Instalar todas las dependencias
RUN npm install

# Copiar código fuente después de dependencias para optimizar caché.
COPY . .

# Ejecutar el build
RUN npm run build

# Usar Nginx para servir los archivos estáticos
FROM nginx:alpine

# Copiar archivos construidos desde la etapa anterior
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Exponer puerto 80
EXPOSE 80

# Ejecutar el entrypoint para generar env.js y arrancar nginx
ENTRYPOINT ["/docker-entrypoint.sh"]