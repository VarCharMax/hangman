/* eslint-disable no-undef */
$(function () {
  'use strict';

  $('#createGame').submit(function (event) {
    $.post($(this).attr('action'), { word: $('#word').val() }, function (result) {
      $('#createdGames').append(result);
    });
    event.preventDefault();
  });

  $('#createdGames').on('click', '.delete', function (event) {
    var $this = $(this);
    $.ajax($this.attr('href'), {
      method: 'delete',
    }).done(function (val) {
      console.log(val);
      $this.closest('.game').remove();
    });
    event.preventDefault();
  });
});
