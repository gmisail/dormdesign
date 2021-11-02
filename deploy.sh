if docker ps | `grep "dormdesign_server" > /dev/null `
then
    echo "[DormDesign] Instance already running. Closing."
    sudo docker-compose down
fi

if [ -f .env ]
then
  echo "[DormDesign] .env file found."
else
  echo "[DormDesign] Cannot deploy without .env file."
  exit 1
fi

echo "[DormDesign] Starting server."
sudo docker-compose --env-file ./.env up --build -d