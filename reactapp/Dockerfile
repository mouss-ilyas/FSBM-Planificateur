# Étape 1 : Construire l'app React Vite
FROM node:latest AS build
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le code source
COPY . .

# Construire pour la production
RUN npm run build

# Étape 2 : Configurer Nginx pour servir l'app
FROM nginx:alpine

# Copier le build dans le dossier Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]