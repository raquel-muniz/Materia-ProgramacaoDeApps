import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Player = 'X' | 'O';
type Cell = Player | null;

const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const emptyBoard = () => new Array<Cell>(9).fill(null);
const cellIds = ['top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right'];

function getWinningLine(board: Cell[]) {
  return winningCombinations.find(([a, b, c]) => (
    board[a] !== null && board[a] === board[b] && board[a] === board[c]
  )) ?? null;
}

export default function App() {
  const [board, setBoard] = useState<Cell[]>(emptyBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);

  const isDraw = !winner && board.every((cell) => cell !== null);

  function handleCellPress(index: number) {
    if (board[index] || winner) return;

    const nextBoard = [...board];
    nextBoard[index] = currentPlayer;
    const line = getWinningLine(nextBoard);
    setBoard(nextBoard);

    if (line) {
      setWinner(currentPlayer);
      setWinningLine(line);
      return;
    }

    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  }

  function resetGame() {
    setBoard(emptyBoard());
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine([]);
  }

  let status = `Vez do jogador ${currentPlayer}`;
  if (winner) status = `Jogador ${winner} venceu!`;
  if (isDraw) status = 'Empate!';

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>DOIS JOGADORES</Text>
      <Text style={styles.title}>Jogo da Velha</Text>
      <Text style={styles.subtitle}>Uma jogada por vez. Quem completa a linha vence.</Text>

      <View style={styles.statusPill}>
        <View style={[styles.statusDot, winner && styles.statusDotWinner]} />
        <Text style={styles.status}>{status}</Text>
      </View>

      <View style={styles.board}>
        {board.map((cell, index) => {
          const isWinningCell = winningLine.includes(index);
          const accessibilityLabel = cell
            ? `Casa ${index + 1}, jogador ${cell}`
            : `Casa ${index + 1}, vazia`;
          return (
            <Pressable
              accessibilityLabel={accessibilityLabel}
              accessibilityRole="button"
              key={cellIds[index]}
              onPress={() => handleCellPress(index)}
              style={({ pressed }) => [
                styles.cell,
                isWinningCell && styles.winningCell,
                pressed && !cell && styles.cellPressed,
              ]}
            >
              <Text style={[styles.cellText, cell === 'X' ? styles.xText : styles.oText]}>
                {cell}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={resetGame}
        style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}
      >
        <Text style={styles.resetText}>Reiniciar partida</Text>
      </Pressable>

      <Text style={styles.footer}>X começa a partida</Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#F6F7FB',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  eyebrow: {
    color: '#6C6FDE',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  title: {
    color: '#242742',
    fontSize: 34,
    fontWeight: '800',
    marginTop: 7,
  },
  subtitle: {
    color: '#8B90A3',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  statusPill: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    flexDirection: 'row',
    marginTop: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  statusDot: {
    backgroundColor: '#6C6FDE',
    borderRadius: 5,
    height: 10,
    marginRight: 8,
    width: 10,
  },
  statusDotWinner: {
    backgroundColor: '#34B27B',
  },
  status: {
    color: '#3B3E5B',
    fontSize: 14,
    fontWeight: '700',
  },
  board: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 24,
    maxWidth: 360,
    padding: 8,
    shadowColor: '#282D59',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    width: '100%',
  },
  cell: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#F8F9FD',
    borderColor: '#E5E7F0',
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    margin: 4,
    width: '30.9%',
  },
  cellPressed: {
    backgroundColor: '#EEF0FF',
  },
  winningCell: {
    backgroundColor: '#E4F7EF',
    borderColor: '#62C79B',
  },
  cellText: {
    fontSize: 48,
    fontWeight: '800',
  },
  xText: {
    color: '#6971D9',
  },
  oText: {
    color: '#E56C7C',
  },
  resetButton: {
    backgroundColor: '#242742',
    borderRadius: 13,
    marginTop: 28,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  resetText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.78,
  },
  footer: {
    color: '#A0A5B5',
    fontSize: 12,
    marginTop: 18,
  },
});
