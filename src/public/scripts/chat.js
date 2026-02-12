 
$(document).ready(function () {
  'use strict';

  var chat = $('form.chat'); // Form
  var socket = io('/chat'); // 'Chat' namespace

  socket.emit('joinRoom', chat.data('room')); // 'Lobby' on home page.

  chat.submit(function (event) {
    socket.emit('chatMessage', $('#message').val());
    $('#message').val('');
    event.preventDefault();
  });

  socket.on('chatMessage', function (data) {
    $('#messages').append(
      $('<p>')
        .text(data.message)
        .addClass(data.type)
        .prepend($('<b>').text(data.username))
    );
  });
});
