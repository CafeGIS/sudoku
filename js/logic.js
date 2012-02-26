function sq(x) { return x*x; }

function parseBoardDesc(boardDesc) {
   var boardState = {
      "fieldsFilled": 0,
      "fieldsGiven": 0,
      "timeLeft": boardDesc[0],
      "boardSize": boardDesc[1],
      "values": []
   };

   for (var y = 0; y < sq(boardState.boardSize); ++y) {
      boardState.values[y] = new Array();

      for (var x = 0; x < sq(boardState.boardSize); ++x) {
         var val = boardDesc[2][x + y*sq(boardState.boardSize)];

         if (val == '.') {
            boardState.values[y][x] = false;
            boardState.fieldsGiven++;
         } else {
            boardState.values[y][x] = val;
         }
      }
   }

   return boardState;
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

function getCell(boardSize, x, y) {
   return Math.floor(x/boardSize) + Math.floor(y/boardSize) * boardSize;
}

function generateBoard($board, boardState) {
   var boardHtml = '<table cellspacing="0" cellpadding="0">';
   
   for (var y = 0; y < sq(boardState.boardSize); ++y) {
      boardHtml += '<tr>';

      for (var x = 0; x < sq(boardState.boardSize); ++x) {
         var val = boardState.values[y][x];

         boardHtml += '<td class="field" id="' +getFieldId(x, y) +'">';

         if (val == false) {
            boardHtml += '<input type="text" class="write-field" />';
         } else {
            boardHtml += '<input type="text" value="' + val
               +'" readonly="readonly" />';
         }

         boardHtml += '</td>';
      }

      boardHtml += '</tr>';
   }

   boardHtml += '</table>';

   $board.html(boardHtml);
   drawBorders($board, boardState.boardSize);
}

function drawBorders($board, boardSize) {
   for (var x = 0; x < sq(boardSize); ++x) {
      for (var y = 0; y < sq(boardSize); ++y) {
         if (x % boardSize == 0 && x > 0)
            getField($board, getFieldId(x, y)).addClass('left-bordered');
         if (y % boardSize == 0 && y > 0) 
            getField($board, getFieldId(x, y)).addClass('top-bordered');
      }
   }
}

function getRowIds($board, boardSize, y) {
   var ids = new Array();

   for (var x = 0; x < sq(boardSize); ++x)
      ids.push(getFieldId(x, y));

   return ids;
}

function getColumnIds($board, boardSize, x) {
   var ids = new Array();

   for (var y = 0; y < sq(boardSize); ++y)
      ids.push(getFieldId(x, y));

   return ids;
}

function getCellIds($board, boardSize, c) {
   var ids = new Array();
   var wh = sq(boardSize);

   for (var i = 0; i < wh; ++i) {
      var x = (c*boardSize) % wh + i%boardSize;
      var y = Math.floor((c*boardSize) / wh)*boardSize + Math.floor(i/boardSize);

      ids.push(getFieldId(x, y));
   }

   return ids;
}

function highlightFields($board, fieldIds) {
   for (var i in fieldIds) {
      getField($board, fieldIds[i]).addClass('highlighted');
   }
}

function highlight($board, boardSize, fieldId) {
   var pos = getFieldPos(fieldId);

   highlightFields($board, getRowIds($board, boardSize, pos[1]));
   highlightFields($board, getColumnIds($board, boardSize, pos[0]));
   highlightFields($board, getCellIds($board, boardSize, getCell(boardSize, pos[0], pos[1])));
}

function unhighlight($board) {
   $(".field", $board).removeClass('highlighted');
}

function checkFields($board, boardSize, fieldIds) {
   var fields = new Array(boardSize);
   var ok = true;

   for (var i in fieldIds) {
      $field = getField($board, fieldIds[i]);
      value = $("input", $field).val();

      if (value.length > 0 && (value < '0' || value > sq(boardSize))) {
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

function checkSolution($board, boardSize) {
   $('.field', $board).removeClass('conflicted');

   for (var x = 0; x < sq(boardSize); ++x) {
      for (var y = 0; y < sq(boardSize); ++y) {
         checkFields($board, boardSize, getRowIds($board, boardSize, y));
         checkFields($board, boardSize, getColumnIds($board, boardSize, x));
         checkFields($board, boardSize, getCellIds($board, boardSize, getCell(boardSize, x, y)));
      }
   }
}

function drawTime($time_left, timeLeft) {
   $time_left.html(timeLeft + 's');
}

$(document).ready(function(){
   var $time_left = $('span#time-left');
   var $board = $('div#main-board');

   $('button').button();
   
   $('button#reset').button().click(function(){
      var boardState = parseBoardDesc(boards[0]);

      generateBoard($board, boardState);
      drawTime($time_left, boardState.timeLeft);

      $('.field input', $board).focus(function(){
         highlight($board, boardState.boardSize, $(this).parent().attr('id'));
      }).blur(function(){
         unhighlight($board);
      }).keyup(function(){
         checkSolution($board, boardState.boardSize);
      });

      $('#state-slider').slider({
         value: boardState.fieldsFilled,
         min: 0,
         max: boardState.fieldsFilled,
         step: 1,
         slide: function(event, ui) {
         }
      });
   }).click();
});
