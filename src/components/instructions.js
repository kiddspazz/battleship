import React, {Component} from 'react';
import Shots from './shots';

export default function Instructions({
  allShipsPlaced,
  shipsCommitted,
  curPlayers,
  name,
  maxPlayers,
  turn,
  whosTurn,
  shots,
  hits,
  turnOrder,
  commitShips,
}) {
  const handleCommitShips = () => commitShips("commit");
  if (!shipsCommitted) {
    return (
      <div className='left_column'>
        <p><b>INSTRUCTIONS</b></p>
        <p>Now you will place your ships. You will place:</p>
        <p>5 "a"s--These a's will be your aircraft carrier.</p>
        <p>4 "b"s--These b's will be your battleship.</p>
        <p>3 "c"s--These c's will be your cruiser.</p>
        <p>3 "s"s--These s's will be your submarine.</p>
        <p>2 "d"s--These d's will be your destroyer.</p>
        <br/>
        <p>Each ship must be in a line horizontally, vertically, or diagonally.</p>
        <p>Ships are not allowed to cross one another.</p>
        <p>No ships may share a cell.</p>
        <br/>
        <p>When you've placed all your ships, click here:</p>
        <button className={ allShipsPlaced ? "" : "not_ready" } onClick={ handleCommitShips }>Commit Ships</button>
      </div>
    );
  } else if (whosTurn.length === 0) {
    return (
    <div className='left_column'>
      <p>Welcome <b>{ name }</b>!</p>
      <p>Players connected: { curPlayers.length }/{ maxPlayers }.</p>
      <p>Players: { curPlayers.join(', ') }</p>
      <p>Waiting on other players to connect and commit their ships.</p>
    </div>
    )
  }

  return (
    <div className='left_column'>
      <p>Welcome <b>{ name }</b>!</p>
      <p>Players connected: { curPlayers.length }/{ maxPlayers }.</p>
      <p>Players: { curPlayers.join(', ') }</p>
      <p>Turn number: { turn + 1 }</p>
      <p>It is { whosTurn }'s turn.</p>
    </div>
  );
}
/*
      <Shots
        shots={ shots }
        hits={ hits }
        players={ [...curPlayers, thisPlayer] }
        turnOrder={ turnOrder }
      />
      */
