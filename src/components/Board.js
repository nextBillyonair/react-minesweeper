import React from 'react';
import Cell from './Cell';
import Queue from './Queue';
import './Board.css';

const deltas = [
  [-1, -1], [-1, 0], [-1, 1],
  [ 0, -1],          [ 0, 1],
  [ 1, -1], [ 1, 0], [ 1, 1]
];


/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}


class Board extends React.Component {

  constructor(props) {
    super(props);

    let [board, bombs] = this.init_board(props)

    this.state = {
      rows: props.N,
      cols:props.N,
      nBombs: props.nBombs,
      cells: board,
      bombs: bombs,
      numUnexposedRemaining: props.N * props.N,
      isGameOver: false,
      isVictory: false
    }

    this.handleClick = this.handleClick.bind(this);
    this.handleReset = this.handleReset.bind(this);

  }

  init_board(props) {
    let N = props.N;

    let board = Array(N*N).fill(null);
    let tmp_board = Array(N*N).fill(null);
    for (var i = 0; i < tmp_board.length; i++) {
      tmp_board[i] = i
    }
    shuffleArray(tmp_board);

    let set = new Set(tmp_board.slice(0, props.nBombs));
    let numbers = this.set_numbers(N, Array.from(set));


    board = board.map(
      (object, i) =>
        <Cell
          key={i}
          i={i}
          row={Math.floor(i / props.N)}
          col={i % props.N}
          number={numbers[i]}
          isBomb={set.has(i) ? true : false}
          isExposed={false}
          isGuess={false}
          onClick={() => this.handleClick(i)}
        />
    )

    return [board, Array.from(set)]

  }

  handleReset() {
    let [board, bombs] = this.init_board(this.props)

    this.setState((state) => ({
      rows: this.props.N,
      cols: this.props.N,
      nBombs: this.props.nBombs,
      cells: board,
      bombs: bombs,
      numUnexposedRemaining: this.props.N * this.props.N,
      isGameOver: false,
      isVictory: false
    }));
  }

  exposeCell(elem) {
    return (<Cell
      key={elem.props.index}
      i={elem.props.index}
      row={elem.props.row}
      col={elem.props.col}
      number={elem.props.number}
      isBomb={elem.props.isBomb}
      isExposed={true}
      isGuess={false}
    />)
  }

  handleClick(i) {

    if (this.state.isGameOver) {
      return;
    }

    let elem = this.state.cells[i];
    let board = this.state.cells;

    board[i] = this.exposeCell(elem);

    // Need to BFS to all other boards to expose
    let num_exposed = 0;
    [board, num_exposed] = this.expand_region(board, i)

    let remaining_cells = this.state.numUnexposedRemaining - num_exposed;
    // GAME OVER 1 -> YOU HIT A BOMB
    let game_over = (elem.props.isBomb || (remaining_cells === this.state.nBombs) );
    let victory = (game_over && !elem.props.isBomb);

    if (game_over) { //expose bombs
      for (var index = 0; index < this.state.nBombs; index++) {
        let bindex = this.state.bombs[index];
        board[bindex] = this.exposeCell(board[bindex]);
      }
    }

    this.setState((state) => ({
      cells: board,
      isGameOver: game_over,
      isVictory: victory,
      numUnexposedRemaining: remaining_cells
    }))

  }

  to_rc(index) {
    return [Math.floor(index / this.props.N), index % this.props.N];
  }

  to_index(row, col) {
    return this.props.N * row + col
  }

  set_numbers(N, bombs) {
     let numbers = Array(N * N).fill(0);
     for (var i = 0; i < bombs.length; i++) {
       let [bomb_row, bomb_col] = this.to_rc(bombs[i]);
       for (var d = 0; d < deltas.length; d++) {
         let r = bomb_row + deltas[d][0];
         let c = bomb_col + deltas[d][1];
         if ( (r >= 0 && r < N) && (c >= 0 && c < N) ) {
           let index = this.to_index(r, c);
           numbers[index] = numbers[index] +  1
         }
       }
     }
     return numbers
  }

  expand_region(board, index) {
    let q = new Queue();
    q.enqueue(index);
    let num_exposed = 1;

    while (!q.isEmpty()) {
      let current = q.dequeue();
      let [curr_row, curr_col] = this.to_rc(current);

      for (var d = 0; d < deltas.length; d++) {
        let r = curr_row + deltas[d][0];
        let c = curr_col + deltas[d][1];
        if ( (r >= 0 && r < this.props.N) && (c >= 0 && c < this.props.N) ) {
          let index = this.to_index(r, c);
          let neighbor = board[index];
          if (!neighbor.props.isBomb && !neighbor.props.isExposed) {
            board[index] = this.exposeCell(neighbor); // expose neighbor
            num_exposed += 1;
          }
          if (neighbor.props.number === 0 && !neighbor.props.isBomb && !neighbor.props.isExposed) {
            q.enqueue(neighbor.props.i);
          }
        }
      }
    }
    return [board, num_exposed];
  }


  render_status_string() {
    if (this.state.isGameOver && !this.state.isVictory) {
      return `BUST!! You had ${this.state.numUnexposedRemaining} cells remaining 😭`;
    }
    if (this.state.isGameOver && this.state.isVictory) {
      return `YAY!! You cleared the minefield!! 😊`;
    }
    return `You have ${this.state.numUnexposedRemaining} cells remaining`;
  }


  render() {
    const status = this.render_status_string();

    const board_rows = Array(this.state.rows).fill(null).map(
      (elem, i) => (
        <div className="board-row" key={100 + i}>
          {this.state.cells.slice(i * this.state.cols, i * this.state.cols + this.state.cols)}
        </div>
      )
    );

    return (
      <div>
        <div className="status">{status}</div>
        <div className="board">
          {board_rows}
        </div>
        <div className="status">
          <button className="status-button" onClick={this.handleReset}>Reset</button>
        </div>
      </div>
    )



  }




}


export default Board;
