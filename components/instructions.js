import React, {Component} from 'react';

class Instructions extends React.Component {
  render() {
    if (!this.props.ships) {
      return (
        <div className="left_column">
        <p><b>INSTRUCTIONS</b></p>
        <p>Now you will place your ships. You will place:</p>
        <p> 5 "a"s--These a 's will be your aircraft carrier.</p>
        <p> 4 "b"s--These b 's will be your battleship.</p>
        <p> 3 "c"s--These c 's will be your cruiser.</p>
        <p> 3 "s"s--These s 's will be your submarine.</p>
        <p> 2 "d"s--These d 's will be your destroyer.</p>
        <p>
        Each ship must be in a line horizontally, vertically, or diagonally.In general, your ships are not allowed to cross one another.However, your submarine is allowed to cross other ships on the diagonal.(Currently you can actually just cross any ships you want...) No ships may share a cell.
        </p>
        </div>
      )

    } else {
      return <p>you've placed enough ships</p>
    }
  }
}
