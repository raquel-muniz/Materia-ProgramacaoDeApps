import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

const options = [
  { label: 'Melhor amigo', rate: 0, description: 'Sem juros para os brothers' },
  { label: 'Amigo', rate: 5, description: '5%' },
  { label: 'Colega', rate: 10, description: '10%' },
  { label: 'Desconhecido', rate: 25, description: '25%' },
];

function parseMoney(value: string) {
  const normalized = value.replaceAll(' ', '').replaceAll('.', '').replace(',', '.');
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function App() {
  const [amount, setAmount] = useState('');
  const [selectedRate, setSelectedRate] = useState(0);
  const [roundUp, setRoundUp] = useState(false);
  const [result, setResult] = useState(0);
  const [error, setError] = useState('');

  function calculate() {
    const borrowedAmount = parseMoney(amount);
    if (borrowedAmount <= 0) {
      setError('Digite um valor maior que zero.');
      setResult(0);
      return;
    }

    const calculatedAmount = borrowedAmount * (1 + selectedRate / 100);
    setResult(roundUp ? Math.ceil(calculatedAmount) : calculatedAmount);
    setError('');
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Calculadora de juros</Text>

        <TextInput
          keyboardType="decimal-pad"
          onChangeText={(value) => {
            setAmount(value);
            setError('');
          }}
          placeholder="Dinheiro emprestado"
          placeholderTextColor="#7C8588"
          style={styles.amountInput}
          value={amount}
        />

        <Text style={styles.sectionTitle}>Quanto a pessoa é sua amiga?</Text>
        <View style={styles.options}>
          {options.map((option) => {
            const selected = option.rate === selectedRate;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                key={option.label}
                onPress={() => setSelectedRate(option.rate)}
                style={styles.optionRow}
              >
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected ? <View style={styles.radioDot} /> : null}
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionDescription}>({option.description})</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.roundingRow}>
          <Text style={styles.roundingLabel}>Arredondar?</Text>
          <Switch
            ios_backgroundColor="#D4D5D7"
            onValueChange={setRoundUp}
            thumbColor={roundUp ? '#6549A5' : '#F0F0F0'}
            trackColor={{ false: '#D4D5D7', true: '#B8A8D8' }}
            value={roundUp}
          />
        </View>

        <View style={styles.resultArea}>
          <Text style={styles.resultLabel}>A pessoa deve te pagar:</Text>
          <Text style={styles.result}>{formatMoney(result)}</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={calculate}
          style={({ pressed }) => [styles.calculateButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.calculateText}>Calcular</Text>
        </Pressable>
      </ScrollView>
      <StatusBar style="dark" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF9FE',
  },
  content: {
    alignSelf: 'center',
    alignItems: 'center',
    maxWidth: 520,
    padding: 16,
    paddingBottom: 26,
    width: '100%',
  },
  title: {
    alignSelf: 'stretch',
    color: '#3B3A3F',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 28,
  },
  amountInput: {
    alignSelf: 'stretch',
    borderBottomColor: '#A7A5A9',
    borderBottomWidth: 2,
    color: '#3B3A3F',
    fontSize: 15,
    height: 48,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    alignSelf: 'stretch',
    color: '#D16655',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 18,
  },
  options: {
    alignSelf: 'stretch',
    marginTop: 10,
  },
  optionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 34,
  },
  radio: {
    alignItems: 'center',
    borderColor: '#66666A',
    borderRadius: 10,
    borderWidth: 2,
    height: 18,
    justifyContent: 'center',
    marginRight: 6,
    width: 18,
  },
  radioSelected: {
    borderColor: '#6549A5',
  },
  radioDot: {
    backgroundColor: '#6549A5',
    borderRadius: 5,
    height: 9,
    width: 9,
  },
  optionLabel: {
    color: '#3B3A3F',
    fontSize: 12,
  },
  optionDescription: {
    color: '#3B3A3F',
    fontSize: 12,
    marginLeft: 4,
  },
  roundingRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  roundingLabel: {
    color: '#5F5E63',
    fontSize: 12,
  },
  resultArea: {
    alignSelf: 'stretch',
    marginTop: 24,
    minHeight: 142,
  },
  resultLabel: {
    color: '#5F5E63',
    fontSize: 12,
  },
  result: {
    color: '#5DA766',
    fontSize: 25,
    marginTop: 16,
    textAlign: 'center',
  },
  error: {
    color: '#C34F4F',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
  calculateButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#6549A5',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    marginTop: 48,
  },
  buttonPressed: {
    opacity: 0.78,
  },
  calculateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
