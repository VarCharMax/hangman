$(document).ready(function () {
  'use strict';

  var chat = $('form.chat');
  var socket = io('/chat'); //Namespace

  socket.emit('joinRoom', chat.data('room')); //'Lobby' on home page.

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
