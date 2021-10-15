if [ -f .env ]
then
  echo "[DormDesign] .env file found."
fi

echo "[DormDesign] Starting server."
sudo docker-compose --env-file ./.env up --build -d