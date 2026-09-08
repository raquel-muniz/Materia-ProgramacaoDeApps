import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const phrases = [
  'Um pequeno passo ja e uma vitoria.',
  'A sorte favorece quem tenta.',
  'Continue jogando, voce esta no caminho.',
  'Hoje e um bom dia para recomecar.',
  'Seu proximo resultado pode surpreender.',
  'Parabens! Voce tirou a maior face.',
];

const pipPositions: Record<number, number[]> = {
  1: [4],
  2: [1, 7],
  3: [1, 4, 7],
  4: [1, 3, 5, 7],
  5: [1, 3, 4, 5, 7],
  6: [1, 2, 3, 5, 6, 7],
};

function DiceFace({ value }: Readonly<{ value: number }>) {
  return (
    <View style={styles.dice} accessibilityLabel={`Dado mostrando ${value}`}>
      {Array.from({ length: 9 }, (_, index) => (
        <View key={index} style={styles.pipCell}>
          {pipPositions[value].includes(index + 1) ? <View style={styles.pip} /> : null}
        </View>
      ))}
    </View>
  );
}

export default function App() {
  const [diceValue, setDiceValue] = useState(1);

  function rollDice() {
    const randomValues = new Uint32Array(1);
    if (globalThis.crypto?.getRandomValues) {
      globalThis.crypto.getRandomValues(randomValues);
      setDiceValue((randomValues[0] % 6) + 1);
      return;
    }
    setDiceValue((Date.now() % 6) + 1);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>JOGO DO DADO</Text>
        <Text style={styles.title}>Role a sorte</Text>
        <Text style={styles.subtitle}>Clique no botao e descubra seu numero.</Text>
      </View>

      <DiceFace value={diceValue} />

      <View style={styles.messageBox}>
        <Text style={styles.numberLabel}>VOCE TIROU</Text>
        <Text style={styles.number}>{diceValue}</Text>
        <Text style={styles.phrase}>{phrases[diceValue - 1]}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sortear um novo numero"
        onPress={rollDice}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>Sortear dado</Text>
        <Text style={styles.buttonArrow}>→</Text>
      </Pressable>

      <Text style={styles.footer}>Numeros de 1 a 6</Text>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#14251F',
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  kicker: {
    color: '#CBE85B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
  },
  title: {
    color: '#F6F4E9',
    fontSize: 40,
    fontWeight: '800',
  },
  subtitle: {
    color: '#AAB9AE',
    fontSize: 15,
    marginTop: 8,
  },
  dice: {
    backgroundColor: '#F6F4E9',
    borderRadius: 28,
    elevation: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: 190,
    justifyContent: 'space-around',
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    width: 190,
  },
  pipCell: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  pip: {
    backgroundColor: '#14251F',
    borderRadius: 10,
    height: 20,
    width: 20,
  },
  messageBox: {
    alignItems: 'center',
    marginTop: 26,
    minHeight: 112,
  },
  numberLabel: {
    color: '#91A298',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  number: {
    color: '#CBE85B',
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 50,
  },
  phrase: {
    color: '#F6F4E9',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#CBE85B',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
    maxWidth: 340,
    minHeight: 56,
    paddingHorizontal: 24,
    width: '100%',
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#14251F',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonArrow: {
    color: '#14251F',
    fontSize: 24,
    marginLeft: 12,
  },
  footer: {
    color: '#6F8275',
    fontSize: 12,
    marginTop: 22,
  },
});
