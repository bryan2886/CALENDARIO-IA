#!/bin/bash
# ============================================================
# Script para construir y subir las imágenes a Docker Hub
# Uso: ./dockerhub-push.sh [tag]
# ============================================================

DOCKERHUB_USER="bandres28"
TAG=${1:-latest}

BACKEND_IMAGE="$DOCKERHUB_USER/calendario-noticia-backend:$TAG"
FRONTEND_IMAGE="$DOCKERHUB_USER/calendario-noticia-frontend:$TAG"

echo "=> Iniciando sesión en Docker Hub..."
docker login

echo ""
echo "=> Construyendo imagen del backend: $BACKEND_IMAGE"
docker build -t "$BACKEND_IMAGE" ./backend

echo ""
echo "=> Construyendo imagen del frontend: $FRONTEND_IMAGE"
docker build -t "$FRONTEND_IMAGE" ./frontend

echo ""
echo "=> Subiendo backend a Docker Hub..."
docker push "$BACKEND_IMAGE"

echo ""
echo "=> Subiendo frontend a Docker Hub..."
docker push "$FRONTEND_IMAGE"

echo ""
echo "Imágenes publicadas:"
echo "  - $BACKEND_IMAGE"
echo "  - $FRONTEND_IMAGE"
