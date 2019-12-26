import React, { Component } from "react";
import { Board } from "./board";

export const BoardArea = ({
  boardSize,
  thisPlayer,
  ships,
  shots,
  potentialShots,
  inputShip,
  commitShips,
  handleClick,
  handleShoot,
  players,
}) => {
  const handleBoardAreaShipInput = (c, r, val) => inputShip(c, r, val);
  const handleBoardAreaCommitShips = (e) => commitShips(e);
  const handleBoardAreaShoot = (c, r) => handleClick(c, r);
  const handleBoardAreaCommitShots = (e) => handleShoot(e);

  if (!thisPlayer.shipsCommitted) {
    return (
        <div className="right_column">
          <Board
            boardSize={boardSize}
            boardStyle="input"
            handleBoardShipInput={handleBoardAreaShipInput}
            boardOwner={thisPlayer.name}
            ships={ships}
            thisPlayer={thisPlayer.name}
            handleBoardShoot={() => {}}
          />
          <br/>
          <button onClick={handleBoardAreaCommitShips}>Submit ship placement</button>
        </div>
    )
  }

  const getBoardShots = (shots, boardOwner) => {
    let thisBoardShots = [];
    for (let p in shots) {
      if (p !== boardOwner && shots[p]) {
        shots[p].forEach((turn) => {
          thisBoardShots.push(...turn);
        })
      }
    }
    return thisBoardShots;
  }

  return (
    <div>
      <div className="board_area">
        <Board
          boardSize={boardSize}
          boardOwner={"shooting"}
          potentialShots={potentialShots}
          thisPlayer={thisPlayer.name}
          handleBoardShoot={handleBoardAreaShoot}
        />
        <Board
          boardSize={boardSize}
          boardOwner={thisPlayer.name}
          ships={ships}
          shots={getBoardShots(shots, thisPlayer.name)}
          potentialShots={potentialShots}
          thisPlayer={thisPlayer.name}
          handleBoardShoot={() => {}}
        />
      </div>
      <div>
        <button onClick={handleBoardAreaCommitShots}>Fire ze missiles!</button>
      </div>
      <div className="board_area">
        {
          players.map((boardOwner) =>
            <Board
              key={boardOwner}
              boardSize={boardSize}
              boardOwner={boardOwner}
              shots={getBoardShots(shots, boardOwner)}
              potentialShots={potentialShots}
              thisPlayer={thisPlayer.name}
              handleBoardShoot={() => {}}
            />
          )
        }
      </div>
    </div>
  )
}

