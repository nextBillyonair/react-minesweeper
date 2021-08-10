import React from 'react';
import './Cell.css';

const mine_char = "\u{1f4a3}";
const guess_char = "\u{1f6a9}";

const mapping = {0:"zero", 1:"one", 2:"two", 3:"three", 4:"four", 5:"five", 6:"six", 7:"seven", 8:"eight"}

class Cell extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      i: props.index,
      row: props.row,
      col: props.col,
      isBomb: props.isBomb,
      number: props.number,
      isExposed: props.isExposed,
      isGuess: props.isGuess
    }

    this.handleClick = props.onClick
    this.handleRightClick = props.onContextMenu

  }


  render() {
    let class_name = '';
    let value = '';

    if (this.state.isExposed) {
      class_name = 'exposed'
      if (this.state.isBomb) {
        value = mine_char;
      } else {
        value = this.state.number;
        class_name = `${class_name} ${mapping[value]}`;
      }
    } else if (this.state.isGuess) {
      value = guess_char;
    }

    return (<button
      className={'cell ' + class_name}
      onClick={this.handleClick}
      onContextMenu={this.handleRightClick}>
        {value}
    </button>
  )
  }

}

export default Cell;
