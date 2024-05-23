// server.js
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];
let iconos = [
  '<i class="fas fa-star"></i>',
  '<i class="far fa-star"></i>',
  '<i class="fas fa-star-of-life"></i>',
  '<i class="fas fa-star-and-crescent"></i>',
  '<i class="fab fa-old-republic"></i>',
  '<i class="fab fa-galactic-republic"></i>',
  '<i class="fas fa-sun"></i>',
  '<i class="fas fa-stroopwafel"></i>',
  '<i class="fas fa-dice"></i>',
  '<i class="fas fa-chess-knight"></i>',
  '<i class="fas fa-chess"></i>',
  '<i class="fas fa-dice-d20"></i>',
];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

let gameState = {
  iconos: [],
  selecciones: [],
};

wss.on("connection", (ws) => {
  clients.push(ws);
  console.log("New client connected");

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    if (data.type === "newGame") {
      gameState.iconos = shuffle([...iconos, ...iconos]).slice(0, 24);
      gameState.selecciones = [];
      clients.forEach((client) => {
        client.send(
          JSON.stringify({ type: "initGame", iconos: gameState.iconos })
        );
      });
    } else if (data.type === "selectCard") {
      gameState.selecciones.push(data.index);
      clients.forEach((client) => {
        client.send(JSON.stringify({ type: "selectCard", index: data.index }));
      });
      if (gameState.selecciones.length === 2) {
        const [firstIndex, secondIndex] = gameState.selecciones;
        const firstCard = gameState.iconos[firstIndex];
        const secondCard = gameState.iconos[secondIndex];
        if (firstCard !== secondCard) {
          setTimeout(() => {
            clients.forEach((client) => {
              client.send(
                JSON.stringify({
                  type: "deselectCards",
                  indices: [firstIndex, secondIndex],
                })
              );
            });
            gameState.selecciones = [];
          }, 1000);
        } else {
          gameState.selecciones = [];
        }
      }
    }
    console.log(message);
  });

  ws.on("close", () => {
    clients = clients.filter((client) => client !== ws);
    console.log("Client disconnected");
  });
});

app.use(express.static("public"));

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
