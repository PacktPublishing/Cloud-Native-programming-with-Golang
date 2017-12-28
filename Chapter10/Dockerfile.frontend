FROM node:8

COPY frontend /app
WORKDIR /app
#RUN npm install -g webpack typescript
#RUN npm install
RUN npx webpack

FROM nginx:1.11-alpine

COPY --from=0 /app/index.html /usr/share/nginx/html/
COPY --from=0 /app/dist /usr/share/nginx/html/dist/
COPY --from=0 /app/node_modules/bootstrap/dist/css/bootstrap.min.css /usr/share/nginx/html/node_modules/bootstrap/dist/css/bootstrap.min.css
COPY --from=0 /app/node_modules/react/umd/react.production.min.js /usr/share/nginx/html/node_modules/react/umd/react.production.min.js
COPY --from=0 /app/node_modules/react-dom/umd/react-dom.production.min.js /usr/share/nginx/html/node_modules/react-dom/umd/react-dom.production.min.js
COPY --from=0 /app/node_modules/promise-polyfill/promise.min.js /usr/share/nginx/html/node_modules/promise-polyfill/promise.min.js
COPY --from=0 /app/node_modules/whatwg-fetch/fetch.js /usr/share/nginx/html/node_modules/whatwg-fetch/fetch.js
