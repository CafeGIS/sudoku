var boardDesc = "020730001" +
                "009010047" +
                "000208900" +
                "000600802" +
                "207853406" +
                "804007000" +
                "003405000" +
                "640080700" +
                "100072090";

var BOARD_SIZE = 9;

function getDescFieldValue(boardDesc, x, y) {
   return boardDesc[x + y*BOARD_SIZE];
}

function getFieldValue($board, x, y) {
   return $("#" +getFieldId(x, y), $board).html();
}

function getFieldId(x, y) {
   return "field-" +x +"-" +y;
}

function generateBoard($board, boardDesc) {
   boardHtml = "<table cellspacing='0' cellpadding='0'>";
   
   for (y = 0; y < BOARD_SIZE; ++y) {
      boardHtml += "<tr>";

      for (x = 0; x < BOARD_SIZE; ++x) {
         val = getDescFieldValue(boardDesc, x, y);

         boardHtml += "<td id='" +getFieldId(x, y) +"'>";

         if (val == 0) {
            boardHtml += "<input type='text' class='write-field' />";
         } else {
            boardHtml += "<input type='text' value='" +val +"' readonly='readonly' />";
         }

         boardHtml += "</td>";
      }

      boardHtml += "</tr>";
   }

   boardHtml += "</table>";

   $board.html(boardHtml);
}

function drawBorders($board) {
   for (x = 0; x < BOARD_SIZE; ++x) {
      for (y = 0; y < BOARD_SIZE; ++y) {
         if (x % 3 == 0 && x > 0)
            $("#" +getFieldId(x, y), $board).css('border-left', '3px solid');
         if (y % 3 == 0 && y > 0) 
            $("#" +getFieldId(x, y), $board).css('border-top', '3px solid');
      }
   }
}

function checkFields($board, fieldIds) {
   exists = new Array(9);

   for (i = 0; i < fieldIds.length; ++i) {
      value = getFieldValue($board, x, y);

      if (value < '0' && value > '9') return false;
      if (exists[value]) return false;
      exists[value] = true;
   }
}

function checkSolution($board) {
   
}

$(document).ready(function () {
   var $board = $("div#board");

   generateBoard($board, boardDesc);
   drawBorders($board);
});
