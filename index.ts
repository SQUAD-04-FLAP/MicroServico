import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // em produção, alterar para o domínio do apache
    methods: ["GET", "POST"],
  },
});

interface Room {
  data: any; // armazenae o JSON inteiro, não defini um modelo especifico já que isso escala demais
  clients: Set<string>; // armazena IDs dos clientes
}

// armazenamento em memória
const rooms: Record<string, Room> = {};

io.on("connection", (socket: Socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  // cliente pode criar sala
  socket.on("create-room", (roomId: string, callback: (response: any) => void) => {
    if (rooms[roomId]) {
      return callback({ ok: false, error: "Sala já existe" });
    }

    // cria a sala com JSON vazio inicial, garante mutabilidade e zero bug inicial
    rooms[roomId] = {
      data: {}, 
      clients: new Set()
    };
    
    console.log(`Sala criada: ${roomId}`);
    callback({ ok: true, message: "Sala criada com sucesso" });
  });

  // cliente pode checar as salas existentes para se conectar
  socket.on("list-rooms", (callback: (rooms: string[]) => void) => {
    const activeRooms = Object.keys(rooms);
    callback(activeRooms);
  });

  // cliente pode entrar em uma sala existe depois de checar
  socket.on("join-room", (roomId: string, callback: (response: any) => void) => {
    const room = rooms[roomId];

    if (!room) {
      return callback({ ok: false, error: "Sala não existe" });
    }

    socket.join(roomId);
    room.clients.add(socket.id);
    
    console.log(`Socket ${socket.id} entrou na sala ${roomId}`);

    // retorna os dados atuais da sala para quem acabou de entrar
    callback({ ok: true, data: room.data });
  });

  // os dados trocados são JSONs inteiros armazenados, sem interferir com o fluxo principal
  socket.on("update-room", (roomId: string, fullJson: any) => {
    const room = rooms[roomId];
    if (!room) return;

    // atualiza a memória do servidor
    room.data = fullJson;

    // envia para todos na sala (broadcast), menos quem enviou, sem isso gera bug
    socket.to(roomId).emit("room-data", fullJson);
    
  });

  // quando a sala não tiver mais ninguém, fecha e apaga da memória
  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);

    // verifica todas as salas para remover este usuário
    for (const roomId of Object.keys(rooms)) {
      const room = rooms[roomId];

      if (room.clients.has(socket.id)) {
        room.clients.delete(socket.id);
        
        // se a sala ficou vazia, deleta da memória
        if (room.clients.size === 0) {
          delete rooms[roomId];
          console.log(`Sala ${roomId} foi fechada (está vazia).`);
        }
      }
    }
  });
});

server.listen(3000, () => {
  console.log("🚀 Servidor WebSocket rodando na porta 3000");
});