import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const tiles = [
  { label: 'person', icon: 'person-outline' as const, color: '#FF3038' },
  { label: 'map', icon: 'map-outline' as const, color: '#FF8524' },
  { label: 'heart', icon: 'heart-outline' as const, color: '#00C462' },
  { label: 'globe', icon: 'globe-outline' as const, color: '#FFC536' },
];

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.phone}>
        <View style={styles.screen}>
          <View style={styles.notch} />
          <View style={styles.grid}>
            {tiles.map((tile) => (
              <Pressable
                accessibilityLabel={tile.label}
                accessibilityRole="button"
                key={tile.label}
                style={({ pressed }) => [
                  styles.tile,
                  { backgroundColor: tile.color },
                  pressed && styles.tilePressed,
                ]}
              >
                <Ionicons color="#185685" name={tile.icon} size={18} />
                <Text style={styles.tileLabel}>{tile.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  phone: {
    backgroundColor: '#050505',
    borderRadius: 46,
    height: '96%',
    maxHeight: 820,
    maxWidth: 410,
    padding: 8,
    width: '100%',
  },
  screen: {
    backgroundColor: '#FF3038',
    borderRadius: 38,
    flex: 1,
    overflow: 'hidden',
  },
  notch: {
    alignSelf: 'center',
    backgroundColor: '#050505',
    borderRadius: 20,
    height: 28,
    position: 'absolute',
    top: 8,
    width: 108,
    zIndex: 2,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tile: {
    alignItems: 'center',
    height: '50%',
    justifyContent: 'center',
    width: '50%',
  },
  tilePressed: {
    opacity: 0.78,
  },
  tileLabel: {
    color: '#183E5B',
    fontSize: 10,
    marginTop: 1,
  },
});
