import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { DEFAULT_PROJECT } from './data';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // adicionar o endereço de producao
    methods: ["GET", "POST"],
  },
});

const roomsData: Record<string, any> = {};

io.on('connection', (socket) => {
  console.log('cliente conectado', socket.id);

  socket.on('joinRoom', (room: string, ack?: (proj: any) => void) => {
    socket.join(room);
    console.log(`${socket.id} entrou na sala ${room}`);

    if (!roomsData[room]) {
      roomsData[room] = { ...DEFAULT_PROJECT };
    }

    const proj = roomsData[room];

    socket.emit('project', proj);

    if (ack) ack(proj);
  });

  socket.on('updateProject', (payload: { room: string; project: any }) => {
    const { room, project } = payload;
    roomsData[room] = project;

    console.log(`projeto da sala ${room} atualizado`);

    socket.to(room).emit('project', project);
  });

  socket.on('getProject', (room: string, ack?: (proj?: any) => void) => {
    ack && ack(roomsData[room]);
  });

  socket.on('disconnecting', () => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        console.log(`${socket.id} saiu da sala ${room}`);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('cliente desconectado', socket.id);

    for (const room of socket.rooms) {
      if (room !== socket.id) {
        const roomInfo = io.sockets.adapter.rooms.get(room);
        if (!roomInfo || roomInfo.size === 0) {
          console.log(`sala ${room} está vazia agora`);
          delete roomsData[room];
        }
      }
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
