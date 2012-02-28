BoardManager.prototype.loadBoard = function(boardId) {
   var thisBoardManager = this;

   if (boardId == null)
      boardId = 0;

   this.board = new Board(this.$board, SIZE_MOD, Board.parseDesc(boards[boardId], SIZE_MOD));

   var saveConf = JSON.parse(localStorage.getItem('board-' +boardId));

   if (saveConf)
      this.board.load(saveConf);

   this.board.initialize();

   this.boardTimer = new Timer('boardTimer', {
      'interval': 1000,
      'timeLeft': function() {
         return thisBoardManager.board.timeLeft();
      },
      'onTick': function() {
         thisBoardManager.board.timeStep();
         thisBoardManager.$timeLeft.html(thisBoardManager.board.timeLeft() + 's');
      },
      'onTimeout': function() {
         var thisTimer = this;
         $('#dialog-timeout').dialog({
            modal: true,
            buttons: {
               'Ok': function() {
                  $(this).dialog('close');
               }
            },
            beforeClose: function() {
               thisBoardManager.board.reset();
               thisTimer.set();
            }
         });
      },
      'onPause': function() {
         var thisTimer = this;
         thisBoardManager.board.$board.addClass('hidden-board');
         $('#dialog-pause').dialog({
            modal: true,
            buttons: {
               'Unpause': function() {
                  $(this).dialog('close');
               }
            },
            beforeClose: function() {
               thisTimer.unpause();
            }
         });
      },
      'onUnpause': function() {
         thisBoardManager.board.$board.removeClass('hidden-board');
      }
   });

   this.currentBoardId = boardId;
   localStorage.setItem('lastBoardId', boardId);
}

BoardManager.prototype.drawBoardButtons = function() {
   var thisBoardManager = this;

   for (var i = 0; i < boards.length; ++i) {
      $('#board-list', this.$dialogChange).append('<button id="board-change-' +i +'">Board ' +(i+1) +'</button>');
   }

   $('button', this.$dialogChange).button().click(function(){
      var id = $(this).attr('id').match(/\d/g);
      thisBoardManager.loadBoard(id[0]);
      thisBoardManager.$dialogChange.dialog('close');
   });
}

BoardManager.prototype.saveBoard = function() {
   if (this.board && this.currentBoardId != undefined)
      localStorage.setItem('board-' +this.currentBoardId, JSON.stringify(this.board.save()));
}

function BoardManager() {
   var thisBoardManager = this;

   this.$board = $('div#main-board');
   this.$timeLeft = $('span#time-left');
   this.$dialogChange = $('#dialog-change');
   this.$dialogHint = $('#dialog-hint');

   $('button').button();

   this.drawBoardButtons();

   this.saveTimer = new Timer('saveTimer', {
      'interval': 10000,
      'onTick': function() {
         thisBoardManager.saveBoard();
      }
   });

   this.loadBoard(localStorage.getItem('lastBoardId'));

   $('button#change').click(function(){
      thisBoardManager.$dialogChange.dialog({
         modal: true,
         buttons: {
            'Cancel': function() {
               $(this).dialog('close');
            }
         }
      });
   });

   $('button#hint').click(function(){
      var allowed = thisBoardManager.board.hint();
      var numbersHtml = '';

      for (var i = 0; i < allowed.length; ++i) {
         if (allowed[i])
            numbersHtml += '<strong>' + (i+1) +'</strong>' + ((i != allowed.length-1) ? ', ' : '.');
      }

      $('#allowed-numbers', thisBoardManager.$dialogHint).html(numbersHtml);
      
      thisBoardManager.$dialogHint.dialog({
         modal: true,
         buttons: {
            'Ok': function() {
               $(this).dialog('close');
            }
         }
      });
   });

   $('button#reset').click(function(){thisBoardManager.board.reset();});
   $('button#undo').click(function(){thisBoardManager.board.undoMove();});
   $('button#redo').click(function(){thisBoardManager.board.redoMove();});
   $('button#pause').click(function(){thisBoardManager.boardTimer.pause();});
}

$(document).ready(function(){
   var boardManager = new BoardManager();
});
