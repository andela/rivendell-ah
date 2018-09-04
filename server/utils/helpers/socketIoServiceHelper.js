import tokenService from '../services/tokenService';
import notificationService from '../services/notificationService';

// an object containing logged in clients, where user id is the key
// and an array of socket id(s) is the value
const clients = {};

// an object of logged in socket ids mapped to its user id
const socketIds = {};

/**
 * Emit all the notifications of a logged in user, on log in
 * @param {Object} socket socket object from socket.io
 * @param {Number} id user id
 * @param {Number} limit pagination limit
 * @param {Number} page pagination page
 * @returns {Null} null
 */
const emitNotifications = (socket, id, limit, page) => {
  notificationService.getUserNotifications({ userId: id, limit, page })
    .then((notifications) => {
      socket.emit('notification', notifications);
    }).catch();
};

/**
 * Store socket id / user id as the client data
 * @param {Object} socket socket object from socket.io
 * @returns {Null} null
 */
const storeClientData = (socket) => {
  socket.on('client data', (data) => {
    const { socketId, token } = data;
    const id = data.id.toLowerCase();
    const verified = tokenService.verifyToken(token);
    if (verified && verified.id === id) {
      emitNotifications(socket, id);
      if (!clients[id]) {
        clients[id] = [];
      }
      clients[id].push(socketId);
      socketIds[socketId] = id;
    }
    // store clients in a global variable for it to be assessable
    // when needed anywhere in the app at an arbitrary time
    global.clients = clients;
  });
};

/**
 * Remove the client from the clients object on disconnect
 * @param {Object} socket socket object from socket.io
 * @returns {Null} null
 */
const onSocketDisconnect = (socket) => {
  socket.on('disconnect', () => {
    const userId = socketIds[socket.id];
    if (clients && Object.keys(clients).length > 0) {
      clients[userId].splice(clients[userId].indexOf(socket.id), 1);
      if (clients[userId].length < 1) {
        delete clients[userId];
      }
      delete socketIds[socket.id];
      global.clients = clients;
    }
  });
};

/**
 * Handle getting a user's notification on demand
 * @param {Object} socket socket object from socket.io
 * @returns {Null} null
 */
const fetchUserNotifications = (socket) => {
  socket.on('fetch notifications', (data) => {
    const {
      id, limit, page, token,
    } = data;
    const verified = tokenService.verifyToken(token);
    if (verified && verified.id === id.toLowerCase()) {
      emitNotifications(socket, id, limit, page);
    }
  });
};

export default {
  storeClientData,
  onSocketDisconnect,
  fetchUserNotifications,
};
