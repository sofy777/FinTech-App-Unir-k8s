#!/bin/sh

# Genera configuración de runtime para la aplicación React
cat > /usr/share/nginx/html/env.js <<EOF
window._env_ = {
  REACT_APP_API_URL: "${REACT_APP_API_URL:-/api}"
};
EOF

exec nginx -g "daemon off;"
