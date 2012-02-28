Board.parseDesc = function(desc, size_mod) {
   var state = {
      'fieldsFilled': 0,
      'fieldsGiven': 0,
      'timeLeft': desc[0],
      'values': []
   };

   for (var y = 0; y < sqr(size_mod); ++y) {
      state.values[y] = new Array();

      for (var x = 0; x < sqr(size_mod); ++x) {
         var val = desc[1][x + y*sqr(size_mod)];

         if (val == '.') {
            state.values[y][x] = false;
            state.fieldsGiven++;
         } else {
            state.values[y][x] = val;
         }
      }
   }

   return state;
}

Board.prototype.getFieldId = function(x, y) {
   return 'field-' +x +'-' +y;
}

Board.prototype.getFieldPos = function(fieldId) {
   var e = /\d/g;
   return fieldId.match(e);
}

Board.prototype.getField = function(fieldId) {
   return $('#' +fieldId, this.$board);
}

Board.prototype.getCell = function(x, y) {
   return Math.floor(x/this.size_mod) + Math.floor(y/this.size_mod) * this.size_mod;
}

Board.prototype.getRowIds = function(y) {
   var ids = new Array();

   for (var x = 0; x < sqr(this.size_mod); ++x)
      ids.push(this.getFieldId(x, y));

   return ids;
}

Board.prototype.getColumnIds = function(x) {
   var ids = new Array();

   for (var y = 0; y < sqr(this.size_mod); ++y)
      ids.push(this.getFieldId(x, y));

   return ids;
}

Board.prototype.getCellIds = function(c) {
   var ids = new Array();
   var wh = sqr(this.size_mod);

   for (var i = 0; i < wh; ++i) {
      var x = (c*this.size_mod) % wh + i%this.size_mod;
      var y = Math.floor((c*this.size_mod) / wh)*this.size_mod + Math.floor(i/this.size_mod);

      ids.push(this.getFieldId(x, y));
   }

   return ids;
}

Board.prototype.highlightFields = function(fieldIds) {
   for (var i in fieldIds) {
      this.getField(fieldIds[i]).addClass('highlighted');
   }
}

Board.prototype.highlight = function(fieldId) {
   var pos = this.getFieldPos(fieldId);

   this.highlightFields(this.getRowIds(pos[1]));
   this.highlightFields(this.getColumnIds(pos[0]));
   this.highlightFields(this.getCellIds(this.getCell(pos[0], pos[1])));
}

Board.prototype.unhighlight = function() {
   $('.field', this.$board).removeClass('highlighted');
}

Board.prototype.checkFields = function(fieldIds) {
   var fields = new Array(this.size_mod);
   var ok = true;

   for (var i in fieldIds) {
      var $field = this.getField(fieldIds[i]);
      value = $('input', $field).val();

      if (value.length > 0 && !/[1-9]/.test(value)) {
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

Board.prototype.checkSolution = function() {
   $('.field', this.$board).removeClass('conflicted');

   for (var x = 0; x < sqr(this.size_mod); ++x) {
      for (var y = 0; y < sqr(this.size_mod); ++y) {
         this.checkFields(this.getRowIds(y));
         this.checkFields(this.getColumnIds(x));
         this.checkFields(this.getCellIds(this.getCell(x, y)));
      }
   }
}

Board.prototype.drawBorders = function() {
   for (var x = 0; x < sqr(this.size_mod); ++x) {
      for (var y = 0; y < sqr(this.size_mod); ++y) {
         if (x % this.size_mod == 0 && x > 0)
            this.getField(this.getFieldId(x, y)).addClass('left-bordered');
         if (y % this.size_mod == 0 && y > 0) 
            this.getField(this.getFieldId(x, y)).addClass('top-bordered');
      }
   }
}

Board.prototype.draw = function() {
   var boardHtml = '<table cellspacing="0" cellpadding="0">';

   for (var y = 0; y < sqr(this.size_mod); ++y) {
      boardHtml += '<tr>';

      for (var x = 0; x < sqr(this.size_mod); ++x) {
         var val = this.startState.values[y][x];

         boardHtml += '<td class="field" id="' +this.getFieldId(x, y) +'">';

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

   this.$board.html(boardHtml);
   this.drawBorders();
}

Board.prototype.processMove = function(fieldId, oldValue, newValue) {
   var pos = this.getFieldPos(fieldId);
   this.redoStack = new Array();
   this.moveStack.push([pos,oldValue,newValue]);
}

Board.prototype.undoMove = function() {
   if (!this.moveStack.length)
      return;

   var move = this.moveStack.pop();
   this.redoStack.push(move);

   $('input', this.getField(this.getFieldId(move[0][0], move[0][1]))).val(move[1]);
   this.checkSolution();
}

Board.prototype.redoMove = function() {
   if (!this.redoStack.length)
      return;

   var move = this.redoStack.pop();
   this.moveStack.push(move);

   $('input', this.getField(this.getFieldId(move[0][0], move[0][1]))).val(move[2]);
   this.checkSolution();
}

Board.prototype.timeStep = function() {
   this.timeElapsed++;
}

Board.prototype.timeLeft = function() {
   return Math.max(0, this.startState.timeLeft - this.timeElapsed);
}

Board.prototype.save = function() {
   return {
      'timeElapsed': this.timeElapsed,
      'moveStack': this.moveStack
   };
}

Board.prototype.load = function(saveConf) {
   this.timeElapsed = saveConf.timeElapsed;
   this.moveStack = saveConf.moveStack;
}

Board.prototype.hint = function() {
   if (this.currentId == null)
      return;

   var pos = this.getFieldPos(this.currentId);

   var allowed = new Array(sqr(this.size_mod));

   var ids = this.getRowIds(pos[1]).concat(this.getColumnIds(pos[0])).concat(this.getCellIds(this.getCell(pos[0], pos[1])));

   for (var i = 0; i < allowed.length; ++i)
      allowed[i] = true;

   for (i in ids)
      allowed[$('input', this.getField(ids[i])).val()-1] = false;

   return allowed;
}

Board.prototype.initialize = function() {
   var thisBoard = this;

   this.draw();

   for (i in this.moveStack) {
      var move = this.moveStack[i];
      $('input', this.getField(this.getFieldId(move[0][0], move[0][1]))).val(move[2]);
   }

   this.checkSolution();

   $('.field input', this.$board).focus(function(){
      thisBoard.currentValue = $(this).val();
      thisBoard.currentId = $(this).parent().attr('id');
      thisBoard.highlight(thisBoard.currentId);
   }).blur(function(){
      thisBoard.unhighlight();
   }).change(function(){
      thisBoard.processMove($(this).parent().attr('id'), thisBoard.currentValue, $(this).val());
      thisBoard.checkSolution();
   });
}

Board.prototype.reset = function(reinitialize) {
   this.moveStack = new Array();
   this.redoStack = new Array();
   this.timeElapsed = 0;

   if (reinitialize == null || reinitialize)
      this.initialize();
}

function Board($board, size_mod, state) {
   this.$board = $board;
   this.size_mod = size_mod;
   this.startState = state;
   this.reset(false);
}
