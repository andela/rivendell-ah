import socketIoServiceHelper from '../helpers/socketIoServiceHelper';

const socketIo = (io) => {
  io.on('connection', (socket) => {
    socketIoServiceHelper.storeClientData(socket);
    socketIoServiceHelper.onSocketDisconnect(socket);
    socketIoServiceHelper.fetchUserNotifications(socket);
    socket.emit('online', { online: true });
  });
};

export default socketIo;
