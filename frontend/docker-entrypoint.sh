#!/bin/sh
cat > /usr/share/nginx/html/assets/js/config.js <<EOF
const API_URL = "${API_URL:-http://localhost:3000}";
EOF
exec "$@"
