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
         $('#modal-timeout').modal('show');
      },
      'onPause': function() {
         thisBoardManager.board.$board.addClass('hidden-board');
         $('#modal-pause').modal('show');
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
      $('#board-list', this.$dialogChange).append('<button class="btn" id="board-change-' +i +'">' +(i+1) +'</button>');
   }

   $('button', this.$dialogChange).click(function(){
      var id = $(this).attr('id').match(/\d/g);
      thisBoardManager.loadBoard(id[0]);
      thisBoardManager.$dialogChange.modal('hide');
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
   this.$dialogChange = $('#modal-change');
   this.$dialogHint = $('#modal-hint');

   this.drawBoardButtons();

   this.saveTimer = new Timer('saveTimer', {
      'interval': 10000,
      'onTick': function() {
         thisBoardManager.saveBoard();
      }
   });

   this.loadBoard(localStorage.getItem('lastBoardId'));

   $('#hint').click(function(){
      var allowed = thisBoardManager.board.hint();
      var numbersHtml = '';

      for (var i = 0; i < allowed.length; ++i) {
         if (allowed[i])
            numbersHtml += '<span class="label">' + (i+1) +'</span> ';
      }

      $('#allowed-numbers', thisBoardManager.$dialogHint).html(numbersHtml);
      
      thisBoardManager.$dialogHint.modal('show');
   });

   $('#modal-timeout').on('hidden', function(){
      thisBoardManager.board.reset();
      thisBoardManager.boardTimer.set();
   });

   $('#modal-pause').on('hidden', function(){
      thisBoardManager.boardTimer.unpause();
   });

   $('#reset').click(function(){thisBoardManager.board.reset();});
   $('#undo').click(function(){thisBoardManager.board.undoMove();});
   $('#redo').click(function(){thisBoardManager.board.redoMove();});
   $('#pause').click(function(){thisBoardManager.boardTimer.pause();});
}

$(document).ready(function(){
   var boardManager = new BoardManager();
});
