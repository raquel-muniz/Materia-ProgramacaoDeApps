import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const words = [
  'JAVASCRIPT', 'PROGRAMAR', 'DESAFIO', 'ALGORITMO', 'COMPUTADOR', 'INTERNET',
  'TECLADO', 'MONITOR', 'SISTEMA', 'CODIGO', 'VARIAVEL', 'FUNCAO', 'OBJETO',
  'MATRIZ', 'SERVIDOR', 'BANCO', 'DADOS', 'REDE', 'SOFTWARE', 'HARDWARE',
  'DESENVOLVEDOR', 'TECNOLOGIA', 'APLICATIVO', 'NAVEGADOR', 'INTERFACE',
  'PROJETO', 'DEPURACAO', 'COMANDO', 'ARQUIVO', 'PROGRAMA', 'LOGICA',
  'SEGURANCA', 'CRIPTOGRAFIA', 'AUTOMACAO', 'INTELIGENCIA', 'ROBO', 'NUVEM',
  'PROCESSADOR', 'MEMORIA', 'SENHA', 'USUARIO', 'CONEXAO', 'PLATAFORMA',
  'GITHUB', 'PYTHON', 'HTML', 'BANCO DE DADOS', 'APRENDIZADO', 'INOVACAO',
  'CRIATIVIDADE',
];

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function randomIndex(maximum: number) {
  const values = new Uint32Array(1);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(values);
    return values[0] % maximum;
  }
  return Date.now() % maximum;
}

function shuffledWords() {
  const result = [...words];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function HangmanDrawing({ errors }: Readonly<{ errors: number }>) {
  return (
    <View style={styles.drawing}>
      <View style={styles.gallowsBase} />
      <View style={styles.gallowsPole} />
      <View style={styles.gallowsTop} />
      <View style={styles.gallowsRope} />
      {errors >= 1 ? <View style={styles.head} /> : null}
      {errors >= 2 ? <View style={styles.body} /> : null}
      {errors >= 3 ? <View style={styles.leftArm} /> : null}
      {errors >= 4 ? <View style={styles.rightArm} /> : null}
      {errors >= 5 ? <View style={styles.leftLeg} /> : null}
      {errors >= 6 ? <View style={styles.rightLeg} /> : null}
    </View>
  );
}

export default function App() {
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(6);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState<'won' | 'lost' | null>(null);
  const poolRef = useRef<string[]>([]);
  const poolIndexRef = useRef(0);

  const startGame = useCallback(() => {
    if (poolIndexRef.current >= poolRef.current.length) {
      poolRef.current = shuffledWords();
      poolIndexRef.current = 0;
    }
    const nextWord = poolRef.current[poolIndexRef.current];
    poolIndexRef.current += 1;
    setWord(nextWord);
    setGuessedLetters([]);
    setAttempts(6);
    setElapsed(0);
    setFinished(null);
  }, []);

  useEffect(() => {
    startGame();
  }, [startGame]);

  useEffect(() => {
    if (finished) return undefined;
    const timer = setInterval(() => setElapsed((current) => current + 1), 1000);
    return () => clearInterval(timer);
  }, [finished]);

  const guessLetter = useCallback((letter: string) => {
    if (finished || guessedLetters.includes(letter)) return;

    const nextGuesses = [...guessedLetters, letter];
    const nextAttempts = word.includes(letter) ? attempts : attempts - 1;
    const won = word.split('').every((character) => nextGuesses.includes(character));
    const lost = nextAttempts <= 0;
    setGuessedLetters(nextGuesses);
    setAttempts(nextAttempts);
    if (won) setFinished('won');
    if (lost) setFinished('lost');
  }, [attempts, finished, guessedLetters, word]);

  const displayWord = word.split('').map((letter) => {
    if (letter === ' ') return ' ';
    return guessedLetters.includes(letter) ? letter : '_';
  });
  const errors = 6 - attempts;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>DESAFIO DE PALAVRAS</Text>
            <Text style={styles.title}>Jogo da Forca</Text>
          </View>
          <View style={styles.timerBox}>
            <Text style={styles.timerLabel}>TEMPO</Text>
            <Text style={styles.timer}>{elapsed}s</Text>
          </View>
        </View>

        <View style={styles.card}>
          <HangmanDrawing errors={errors} />
          <View style={styles.attemptsRow}>
            <Text style={styles.attemptsLabel}>TENTATIVAS</Text>
            <Text style={styles.attemptsValue}>{attempts} / 6</Text>
          </View>
        </View>

        <View style={styles.wordBox}>
          <Text style={styles.word}>{displayWord.join(' ')}</Text>
          {finished ? (
            <Text style={[styles.status, finished === 'won' ? styles.win : styles.loss]}>
              {finished === 'won' ? `Voce venceu em ${elapsed}s!` : `A palavra era ${word}`}
            </Text>
          ) : (
            <Text style={styles.status}>Escolha uma letra para revelar a palavra</Text>
          )}
        </View>

        <View style={styles.keyboard}>
          {alphabet.map((letter) => {
            const used = guessedLetters.includes(letter);
            const correct = used && word.includes(letter);
            return (
              <Pressable
                accessibilityRole="button"
                disabled={used || Boolean(finished)}
                key={letter}
                onPress={() => guessLetter(letter)}
                style={[styles.key, used && styles.keyUsed, correct && styles.keyCorrect]}
              >
                <Text style={[styles.keyText, used && styles.keyTextUsed]}>{letter}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable onPress={startGame} style={({ pressed }) => [styles.newGame, pressed && styles.pressed]}>
          <Text style={styles.newGameText}>{finished ? 'Jogar novamente' : 'Nova palavra'}</Text>
        </Pressable>
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F6F7FB',
    flex: 1,
  },
  content: {
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: 680,
    padding: 22,
    width: '100%',
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  eyebrow: {
    color: '#6973D8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  title: {
    color: '#20243D',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 5,
  },
  timerBox: {
    alignItems: 'flex-end',
  },
  timerLabel: {
    color: '#9297A9',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  timer: {
    color: '#20243D',
    fontSize: 21,
    fontWeight: '800',
    marginTop: 3,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    elevation: 3,
    marginTop: 22,
    padding: 20,
    shadowColor: '#27305D',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    width: '100%',
  },
  drawing: {
    height: 210,
    position: 'relative',
    width: 220,
  },
  gallowsBase: { backgroundColor: '#6973D8', bottom: 8, height: 9, left: 18, position: 'absolute', width: 154 },
  gallowsPole: { backgroundColor: '#6973D8', bottom: 16, height: 176, left: 42, position: 'absolute', width: 9 },
  gallowsTop: { backgroundColor: '#6973D8', height: 9, left: 42, position: 'absolute', top: 17, width: 103 },
  gallowsRope: { backgroundColor: '#6973D8', height: 31, left: 140, position: 'absolute', top: 17, width: 7 },
  
  head: { backgroundColor: '#FFFFFF', borderColor: '#20243D', borderRadius: 26, borderWidth: 6, height: 40, left: 123, position: 'absolute', top: 42, width: 40 },
  
  body: { backgroundColor: '#20243D', borderRadius: 4, height: 64, left: 140.5, position: 'absolute', top: 77, width: 7 },
  
  leftArm: { backgroundColor: '#20243D', borderRadius: 4, height: 7, left: 118, position: 'absolute', top: 85, transform: [{ rotate: '28deg' }], width: 27 },
  
  rightArm: { backgroundColor: '#20243D', borderRadius: 4, height: 7, left: 142, position: 'absolute', top: 85, transform: [{ rotate: '-28deg' }], width: 27 },
  
  leftLeg: { backgroundColor: '#20243D', borderRadius: 4, height: 7, left: 117, position: 'absolute', top: 149, transform: [{ rotate: '-58deg' }], width: 35 },
  
  rightLeg: { backgroundColor: '#20243D', borderRadius: 4, height: 7, left: 135, position: 'absolute', top: 149, transform: [{ rotate: '58deg' }], width: 35 },

  attemptsRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  attemptsLabel: { color: '#9297A9', fontSize: 11, fontWeight: '800', letterSpacing: 1.3 },
  attemptsValue: { color: '#6973D8', fontSize: 16, fontWeight: '800' },
  wordBox: { alignItems: 'center', marginTop: 25, minHeight: 78, width: '100%' },
  word: { color: '#20243D', fontSize: 25, fontWeight: '800', letterSpacing: 2, textAlign: 'center' },
  status: { color: '#858B9E', fontSize: 13, marginTop: 13, textAlign: 'center' },
  win: { color: '#1BA56E', fontWeight: '700' },
  loss: { color: '#DC5C69', fontWeight: '700' },
  keyboard: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 14, width: '100%' },
  key: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#E2E4EE', borderRadius: 9, borderWidth: 1, height: 43, justifyContent: 'center', width: 42 },
  keyUsed: { backgroundColor: '#ECEEF5', borderColor: '#ECEEF5' },
  keyCorrect: { backgroundColor: '#DBF4E9', borderColor: '#B6E6D0' },
  keyText: { color: '#343A59', fontSize: 14, fontWeight: '700' },
  keyTextUsed: { color: '#A7ABBB' },
  newGame: { backgroundColor: '#6973D8', borderRadius: 13, marginTop: 25, paddingHorizontal: 28, paddingVertical: 14 },
  newGameText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.78 },
});
