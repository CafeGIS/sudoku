var BOARD_SIZE = 9;

function getDescFieldValue(boardDesc, x, y) {
   return boardDesc[x + y*BOARD_SIZE];
}

function getFieldId(x, y) {
   return 'field-' +x +'-' +y;
}

function getFieldPos(fieldId) {
   var e = /\d/g;
   return fieldId.match(e);
}

function getField($board, fieldId) {
   return $('#' +fieldId, $board);
}

function getCell(x, y) {
   return Math.floor(x/3) + Math.floor(y/3) * 3;
}

function generateBoard($board, boardDesc) {
   var boardHtml = '<table cellspacing="0" cellpadding="0">';
   
   for (var y = 0; y < BOARD_SIZE; ++y) {
      boardHtml += '<tr>';

      for (var x = 0; x < BOARD_SIZE; ++x) {
         val = getDescFieldValue(boardDesc, x, y);

         boardHtml += '<td class="field" id="' +getFieldId(x, y) +'">';

         if (val == 0) {
            boardHtml += '<input type="text" class="write-field" />';
         } else {
            boardHtml += '<input type="text" value="' +val 
               +'" readonly="readonly" />';
         }

         boardHtml += '</td>';
      }

      boardHtml += '</tr>';
   }

   boardHtml += '</table>';

   $board.html(boardHtml);
}

function drawBorders($board) {
   for (var x = 0; x < BOARD_SIZE; ++x) {
      for (var y = 0; y < BOARD_SIZE; ++y) {
         if (x % 3 == 0 && x > 0)
            getField($board, getFieldId(x, y)).addClass('left-bordered');
         if (y % 3 == 0 && y > 0) 
            getField($board, getFieldId(x, y)).addClass('top-bordered');
      }
   }
}

function getRowIds($board, y) {
   var ids = new Array();

   for (var x = 0; x < BOARD_SIZE; ++x)
      ids.push(getFieldId(x, y));

   return ids;
}

function getColumnIds($board, x) {
   var ids = new Array();

   for (var y = 0; y < BOARD_SIZE; ++y)
      ids.push(getFieldId(x, y));

   return ids;
}

function getCellIds($board, c) {
   var ids = new Array();

   for (var i = 0; i < BOARD_SIZE; ++i) {
      var x = (c*3) % BOARD_SIZE + i%3;
      var y = Math.floor((c*3) / BOARD_SIZE)*3 + Math.floor(i/3);

      ids.push(getFieldId(x, y));
   }

   return ids;
}

function highlightFields($board, fieldIds) {
   for (var i in fieldIds) {
      getField($board, fieldIds[i]).addClass('highlighted');
   }
}

function highlight($board, fieldId) {
   var pos = getFieldPos(fieldId);

   highlightFields($board, getRowIds($board, pos[1]));
   highlightFields($board, getColumnIds($board, pos[0]));
   highlightFields($board, getCellIds($board, getCell(pos[0], pos[1])));
}

function unhighlight($board) {
   $(".field", $board).removeClass('highlighted');
}

function checkFields($board, fieldIds) {
   var fields = new Array(BOARD_SIZE);
   var ok = true;

   for (var i in fieldIds) {
      $field = getField($board, fieldIds[i]);
      value = $("input", $field).val();

      if (value.length > 0 && (value < '0' || value > '9')) {
         $field.addClass('conflicted');
         ok = false;
      }

      if (typeof fields[value] == 'object') {
         fields[value].addClass('conflicted');
         $field.addClass('conflicted');
         ok = false;
      }

      fields[value] = $field;
   }

   return ok;
}

function checkSolution($board) {
   $(".field", $board).removeClass('conflicted');

   for (var x = 0; x < BOARD_SIZE; ++x) {
      for (var y = 0; y < BOARD_SIZE; ++y) {
         checkFields($board, getRowIds($board, y));
         checkFields($board, getColumnIds($board, x));
         checkFields($board, getCellIds($board, getCell(x, y)));
      }
   }
}

$(document).ready(function(){
   var $selection = $("div#selection");
   var $board = $("div#board");

   var selectHtml = '<select>';
   for (var i in boards)
      selectHtml += '<option value="' +i +'">' +boards[i][0] +'</option>';
   selectHtml += '</select>';

   $selection.html(selectHtml);

   $('select', $selection).change(function(){
      var boardDesc = boards[$(this).val()][1];

      generateBoard($board, boardDesc);
      drawBorders($board);

      $('.field input', $board).focus(function(){
         highlight($board, $(this).parent().attr('id'));
      }).blur(function(){
         unhighlight($board);
      }).keyup(function(){
         checkSolution($board);
      });
   }).change();
});
