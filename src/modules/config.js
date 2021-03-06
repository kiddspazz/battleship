import joinGame from './connect';

// Checks config for errors: Only alphanumeric values, less the 20 characters, and numbers
// fit the board size and number of player restrictions.
// RETURNS: TRUE if there are errors, FALSE if no errors.
const errorsInConfigInput = (config) => {
  let errorMsg = '';
  const regx = /[^a-zA-Z0-9 ]/;
  const computerToHuman = {
    playerName: 'player name',
    gameId: 'game id',
    boardSize: 'board size',
    maxPlayers: 'number of players',
    playerColor: 'player color',
  };


  const entries = config.keys();
  entries.forEach((entry) => {
    if (config[entry].length === 0) {
      errorMsg += `You didn't choose a ${computerToHuman[entry]}.\n`;
    }

    if (config[entry].length > 20) {
      errorMsg += `Your ${computerToHuman[entry]} is greater than 20 characters.\n`;
    }
  });

  if (regx.test(config.playerName)) {
    errorMsg += 'You can only use letters or numbers in player name.\n';
  }

  if (regx.test(config.gameId)) {
    errorMsg += 'You can only use letters or numbers in game id.\n';
  }

  if (config.boardSize % 1 !== 0 || config.boardSize < 10 || config.boardSize > 20) {
    errorMsg += 'You must enter a whole number between 10 and 20 for board size.\n';
  }

  if (config.maxPlayers % 1 !== 0 || config.maxPlayers < 2 || config.maxPlayers > 4) {
    errorMsg += 'You must enter a whole number between 2 and 4 for number of players.\n';
  }

  if (errorMsg.length > 0) {
    errorMsg += 'Try again.';
    alert(errorMsg);
    return true;
  }
  return false;
};

export default function submitConfig(config, db, self) {
  if (errorsInConfigInput(config)) return;

  db.ref('/').once('value').then((snapshot) => {
    if (snapshot.hasChild(config.gameId)) {
      alert('Game ID already taken, choose a new game ID.');
      return;
    }

    // Initialize configurations for db.
    const fBState = {
      config: {
        boardSize: config.boardSize,
        gameId: config.gameId,
        maxPlayers: config.maxPlayers,
        maxShips: {
          a: 5,
          b: 4,
          c: 3,
          s: 3,
          d: 2,
        },
      },

      gameState: {
        turnNumber: 0,
        turnOrder: [config.playerName],
        shots: [{ [config.playerName]: false }],

        // Initialize current user in players.
        players: {
          [config.playerName]: {
            connected: false,
            thisPlayerTurn: false,
            shipsAreCommitted: false,
            lost: false,
            playerColor: config.playerColor,
            hitsOnThisPlayer: {
              a: [false],
              b: [false],
              c: [false],
              s: [false],
              d: [false],
            },
          },
        },
      },

      ships: { [config.playerName]: false },
    };

    // Set db state.
    db.ref(config.gameId).set(fBState)
      .then(joinGame(db, self, config.gameId, config.playerName));
  });
}
