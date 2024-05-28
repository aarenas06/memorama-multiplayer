const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");

// Preparar el servidor para HTTPS (si tienes un certificado SSL/TLS)
// const serverOptions = {
//   key: fs.readFileSync('path/to/your/privkey.pem'),
//   cert: fs.readFileSync('path/to/your/cert.pem')
// };
// const server = https.createServer(serverOptions, app);

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

class GameState {
  constructor() {
    this.clients = [];
    this.iconos = [
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
    this.gameState = {
      iconos: [],
      selecciones: [],
    };
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  addClient(client) {
    this.clients.push(client);
    console.log("New client connected");
  }

  removeClient(client) {
    this.clients = this.clients.filter((c) => c !== client);
    console.log("Client disconnected");
  }

  handleMessage(client, message) {
    const data = JSON.parse(message);
    if (data.type === "newGame") {
      this.gameState.iconos = this.shuffle([
        ...this.iconos,
        ...this.iconos,
      ]).slice(0, 24);
      this.gameState.selecciones = [];
      this.clients.forEach((c) => {
        c.send(
          JSON.stringify({ type: "initGame", iconos: this.gameState.iconos })
        );
      });
    } else if (data.type === "selectCard") {
      this.gameState.selecciones.push(data.index);
      this.clients.forEach((c) => {
        c.send(JSON.stringify({ type: "selectCard", index: data.index }));
      });
      if (this.gameState.selecciones.length === 2) {
        const [firstIndex, secondIndex] = this.gameState.selecciones;
        const firstCard = this.gameState.iconos[firstIndex];
        const secondCard = this.gameState.iconos[secondIndex];
        if (firstCard !== secondCard) {
          setTimeout(() => {
            this.clients.forEach((c) => {
              c.send(
                JSON.stringify({
                  type: "deselectCards",
                  indices: [firstIndex, secondIndex],
                })
              );
            });
            this.gameState.selecciones = [];
          }, 1000);
        } else {
          this.gameState.selecciones = [];
        }
      }
    }
  }
}

const gameState = new GameState();

wss.on("connection", (ws) => {
  gameState.addClient(ws);

  ws.on("message", (message) => {
    gameState.handleMessage(ws, message);
  });

  ws.on("close", () => {
    gameState.removeClient(ws);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

app.use(express.static("public"));

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
