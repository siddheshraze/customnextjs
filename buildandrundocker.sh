docker build -t siddheshambokar/forestgeo-app:latest -f Dockerfile .
docker run --env-file .env.local -dp 3000:3000 --rm --name forestgeo-container  siddheshambokar/forestgeo-app:latest