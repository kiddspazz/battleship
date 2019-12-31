import { randomizeTurnOrder } from './ships.js';
import { allPlayersShipsPlaced } from './ships.js';
import { getHits } from './shooting.js';
import Board from '../components/board.js';

// returns a user-chosen name that is under 20 alphanumeric characters
const choosePlayerName = (extraPrompt = '') => {
  let name = prompt(extraPrompt + 'Choose a player name (or enter your player name to log back in): ');
  let regx = /[^a-zA-Z0-9 ]/;

  while (regx.test(name)) {
    name = choosePlayerName('Name must contain only numbers and/or letters. \n');
    while (name.length > 20 || name.length === 0) {
      name = choosePlayerName('Name must be between 1 & 20 characters long. \n');
    }
  }

  return name;
};

const getBoardInfo = (size, style, owner, ships, shots) => {
  const boardInfo = {
      config: {
        size,
        style,
        owner,
        maxShips: {
          a: 5,
          b: 4,
          c: 3,
          s: 3,
          d: 2,
        },
      },
    // fill sets all elements to the same reference, so needed a special map thingy here...
    data: (new Array(size).fill(null).map(() => new Array(size).fill(null).map(() => ({ ship: "", shot: false, color: "white" })))),
    };

  if (ships) {
    for (let ship in ships) {
      for (let i = 0; i < ships[ship].length; i++) {
        const coord = ships[ship][i];
        boardInfo.data[coord[0]][coord[1]].ship = ship;
      }
    }
  }

  if (shots) {
    for (let turn in shots) {
      for (let shot in shots[turn]) {
        const coord = shots[turn][shot];
        boardInfo.data[coord[0]][coord[1]].shot = turn;
      }
    }
  }

  return boardInfo;
};

const getShotsOnThisPlayer = (player, shots) => {
  let newShots = [];
  for (let turn in shots) {
    newShots[turn] = [];
    for (let name in shots[turn]) {
      if (!player === name) {
        for (let shot in shots[turn][name]) {
          newShots[turn].push(shot);
        }
      }
    }
  }
  return shots;
}

const getBoards = (dbData, name) => {
  const ships = dbData.ships[name];
  const shots = dbData.shots;
  const size = dbData.config.boardSize;
  const players = dbData.gameState.players;

  if (!ships) {
    return [getBoardInfo(size, 'input', name, ships, false)];
  }

  const boardInfo = [];
  for (let player in players) {
    if (player !== name) {
      boardInfo.push(getBoardInfo(
        size,
        'destination',
        player,
        [],
        dbData.gameState.turn ? getShotsOnThisPlayer(player, shots) : []
      ))
    }
  }

  boardInfo.push(getBoardInfo(size, 'shooting', name, false, false));
  boardInfo.push(getBoardInfo(
    size,
    'ships',
    name,
    ships,
    dbData.gameState.turn ? getShotsOnThisPlayer(name, shots) : false
  ));

  return boardInfo;
};

const getLocalInfo = (ships, shots, name) => {
  return {
    name,
    ships,
    status: 'gameOn',
  };
};

const getLocalState = (dbData, name) => {
  return {
    config: dbData.config,
    gameState: dbData.gameState,
    localInfo: {
      ...getLocalInfo(dbData.ships[name], dbData.shots[name], name),
      boardInfo: getBoards(dbData, name),
    },
  };
};

function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// connects player to gameId in db
// tells db to update client on changes to db
const connect = (db, gameId, name, info, self, dbData) => {
  info.connected = true;
  db.ref(`${ gameId }/gameState/players/${ name }`).set(info);
  db.ref(`${ gameId }/gameState/players/${ name }/connected`).onDisconnect().set(false);
  if (!dbData.ships[name]) {
    db.ref(`${ gameId }/ships/${ name }`).set(false);
  }

  if (!dbData.shots[0][name]) {
    db.ref(`${ gameId }/shots/0/${ name }`).set(false);
  }

  // Tells db to update client on changes to db
  db.ref(gameId).on('value', snapshot => {
    const dbPlayers = snapshot.val().gameState.players;
    const playersArray = [];
    for (let player in dbPlayers) {
      playersArray.push(player);
    }

    // if all players have committed ships
    if (playersArray.filter(player => !dbPlayers[player].shipsCommitted).length === 0 && !snapshot.val().gameState.turnOrder) {
      const turnOrder = shuffle(playersArray);
      db.ref(`${ gameId }/gameState/turnOrder`).set(turnOrder);
      db.ref(`${ gameId }/gameState/players/${ turnOrder[0] }/thisPlayerTurn`).set(true);
    }

    self.setState(getLocalState(snapshot.val(), name));
    self.forceUpdate();
  });
};

export default function joinGame(
  db,
  self,
  gameId = prompt('Enter game id: '),
  name,
) {
  if (gameId === null || gameId.length === 0) return;
  if (!name) name = choosePlayerName();

  db.ref(gameId).once('value', (snapshot) => {
    if (!snapshot.exists()) {
      alert('No such game in database.');
      return;
    }

    const { config, gameState } = snapshot.val();
    let numPlayers = Object.keys(gameState.players).length;
    let playerInfo;

    // determines playerInfo based on if player is reconnecting or connecting for the first time
    // while also rejecting if player is already connected or if there's no room for a new player
    if (name in gameState.players) {
      if (gameState.players[name].connected) {
        alert('That player is already connected.');
        return;
      }

      playerInfo = gameState.players[name];

    } else if (numPlayers >= config.maxPlayers) {
      alert('Game is full.');
      return;
    } else {
      playerInfo = {
        connected: true,
        thisPlayerTurn: false,
        shipsCommitted: false,
        lost: false,
      };
    };

    connect(db, gameId, name, playerInfo, self, snapshot.val());

    if (allPlayersShipsPlaced(gameState.players, numPlayers) && gameState.turnOrder === 0) {
      const turnOrder = randomizeTurnOrder(players);
      db.ref(`${ gameId }/gameState/turnOrder`).set(turnOrder);
      db.ref(`${ gameId }/gameState/players/${ turnOrder[0] }/thisPlayerTurn`).set(true);
    }
  });
};
