module.exports = function(io) {
  // Example socket event
  io.on('connection', (socket) => {
    console.log('A user connected to stockSocket');
    // Add your socket logic here
    socket.on('disconnect', () => {
      console.log('User disconnected from stockSocket');
    });
  });
};
