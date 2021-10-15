sudo docker-compose down

if [ -f .env ]
then
  echo "[DormDesign] .env file found."
else
  echo "[DormDesign] Cannot deploy without .env file."
  exit 1
fi

echo "[DormDesign] Starting server."
sudo docker-compose --env-file ./.env up --build -d