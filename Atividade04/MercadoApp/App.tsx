import { StatusBar } from 'expo-status-bar';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type ShoppingItem = {
  id: string;
  name: string;
  purchased: boolean;
};

type Account = {
  name: string;
  password: string;
};

type ShoppingContextValue = {
  userName: string;
  items: ShoppingItem[];
  login: (email: string, password: string) => string | null;
  register: (name: string, email: string, password: string) => string | null;
  logout: () => void;
  addItem: (name: string) => void;
  toggleItem: (id: string) => void;
};

const ShoppingContext = createContext<ShoppingContextValue | null>(null);

function ShoppingProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [userName, setUserName] = useState('');
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [accounts, setAccounts] = useState<Record<string, Account>>({
    'demo@mercado.app': { name: 'demo', password: '123456' },
  });
  const nextItemId = useRef(0);

  const login = useCallback((email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const atIndex = normalizedEmail.indexOf('@');
    const dotIndex = normalizedEmail.lastIndexOf('.');
    if (atIndex <= 0 || dotIndex <= atIndex + 1 || dotIndex === normalizedEmail.length - 1) {
      return 'Digite um e-mail válido.';
    }
    if (password.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres.';
    }
    const account = accounts[normalizedEmail];
    if (account?.password !== password) {
      return 'E-mail ou senha incorretos.';
    }

    setUserName(account.name);
    return null;
  }, [accounts]);

  const register = useCallback((name: string, email: string, password: string) => {
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const atIndex = normalizedEmail.indexOf('@');
    const dotIndex = normalizedEmail.lastIndexOf('.');
    if (trimmedName.length < 2) {
      return 'Digite seu nome completo.';
    }
    if (atIndex <= 0 || dotIndex <= atIndex + 1 || dotIndex === normalizedEmail.length - 1) {
      return 'Digite um e-mail válido.';
    }
    if (password.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres.';
    }
    if (accounts[normalizedEmail]) {
      return 'Este e-mail já está cadastrado.';
    }

    setAccounts((currentAccounts) => ({
      ...currentAccounts,
      [normalizedEmail]: { name: trimmedName, password },
    }));
    setUserName(trimmedName);
    return null;
  }, [accounts]);

  const logout = useCallback(() => {
    setUserName('');
  }, []);

  const addItem = useCallback((name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setItems((currentItems) => [
      ...currentItems,
      { id: `${Date.now()}-${nextItemId.current++}`, name: trimmedName, purchased: false },
    ]);
  }, []);

  const toggleItem = useCallback((id: string) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, purchased: !item.purchased } : item,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({ userName, items, login, register, logout, addItem, toggleItem }),
    [userName, items, login, register, logout, addItem, toggleItem],
  );

  return <ShoppingContext.Provider value={value}>{children}</ShoppingContext.Provider>;
}

function useShopping() {
  const context = useContext(ShoppingContext);
  if (!context) {
    throw new Error('useShopping must be used inside ShoppingProvider');
  }
  return context;
}

function LoginScreen() {
  const { login, register } = useShopping();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = useCallback(() => {
    const result = mode === 'login'
      ? login(email, password)
      : register(name, email, password);
    setError(result ?? '');
  }, [email, login, mode, name, password, register]);

  const switchMode = useCallback(() => {
    setMode((currentMode) => (currentMode === 'login' ? 'register' : 'login'));
    setError('');
  }, []);

  return (
    <View style={styles.safeArea}>
      <View style={styles.loginContainer}>
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>+</Text>
        </View>
        <Text style={styles.eyebrow}>LISTA DE COMPRAS</Text>
        <Text style={styles.loginTitle}>Vamos às compras.</Text>
        <Text style={styles.loginDescription}>
          {mode === 'login'
            ? 'Entre para organizar tudo o que precisa levar.'
            : 'Crie sua conta e comece a organizar suas compras.'}
        </Text>
        <View style={styles.loginForm}>
          {mode === 'register' ? (
            <>
              <Text style={styles.inputLabel}>SEU NOME</Text>
              <TextInput
                autoCapitalize="words"
                onChangeText={(value) => {
                  setName(value);
                  setError('');
                }}
                placeholder="Como podemos chamar você?"
                placeholderTextColor="#8A918D"
                style={styles.input}
                value={name}
              />
              <Text style={[styles.inputLabel, styles.passwordLabel]}>E-MAIL</Text>
            </>
          ) : (
            <Text style={styles.inputLabel}>E-MAIL</Text>
          )}
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={(value) => {
              setEmail(value);
              setError('');
            }}
            placeholder="voce@exemplo.com"
            placeholderTextColor="#8A918D"
            style={styles.input}
            value={email}
          />
          <Text style={[styles.inputLabel, styles.passwordLabel]}>SENHA</Text>
          <TextInput
            autoComplete="password"
            onChangeText={(value) => {
              setPassword(value);
              setError('');
            }}
            onSubmitEditing={handleLogin}
            placeholder="••••••••"
            placeholderTextColor="#8A918D"
            returnKeyType="done"
            secureTextEntry
            style={styles.input}
            value={password}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Pressable
            accessibilityRole="button"
            disabled={!email.trim() || !password || (mode === 'register' && !name.trim())}
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.primaryButton,
              (!email.trim() || !password || (mode === 'register' && !name.trim())) && styles.disabledButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {mode === 'login' ? 'Entrar  →' : 'Criar conta  →'}
            </Text>
          </Pressable>
        </View>
        <Pressable accessibilityRole="button" onPress={switchMode} style={styles.modeButton}>
          <Text style={styles.modeText}>
            {mode === 'login' ? 'Ainda não tem uma conta? ' : 'Já tem uma conta? '}
            <Text style={styles.modeTextStrong}>
              {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
            </Text>
          </Text>
        </Pressable>
        {mode === 'login' ? (
          <Text style={styles.loginFooter}>Demo: demo@mercado.app  |  senha: 123456</Text>
        ) : null}
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

function ShoppingScreen() {
  const { userName, items, addItem, toggleItem, logout } = useShopping();
  const [newItem, setNewItem] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'purchased'>('all');

  const pendingCount = useMemo(
    () => items.filter((item) => !item.purchased).length,
    [items],
  );

  const visibleItems = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return items.filter((item) => {
      const matchesSearch = item.name.toLocaleLowerCase().includes(normalizedSearch);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'pending' && !item.purchased) ||
        (filter === 'purchased' && item.purchased);
      return matchesSearch && matchesFilter;
    });
  }, [filter, items, search]);

  const handleAddItem = useCallback(() => {
    if (!newItem.trim()) return;
    addItem(newItem);
    setNewItem('');
  }, [addItem, newItem]);

  const renderItem = useCallback(
    ({ item }: { item: ShoppingItem }) => (
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.purchased }}
        onPress={() => toggleItem(item.id)}
        style={({ pressed }) => [styles.itemRow, pressed && styles.itemRowPressed]}
      >
        <View style={[styles.checkbox, item.purchased && styles.checkboxChecked]}>
          {item.purchased && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={[styles.itemName, item.purchased && styles.itemNamePurchased]}>
          {item.name}
        </Text>
        <Text style={styles.itemAction}>{item.purchased ? 'Desfazer' : 'Comprar'}</Text>
      </Pressable>
    ),
    [toggleItem],
  );

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.screen}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>MINHA LISTA</Text>
            <Text style={styles.greeting}>Olá, {userName}.</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={logout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Sair</Text>
          </Pressable>
        </View>

        <View style={styles.summary}>
          <View>
            <Text style={styles.summaryLabel}>AINDA FALTA</Text>
            <Text style={styles.summaryNumber}>{pendingCount}</Text>
            <Text style={styles.summaryText}>{pendingCount === 1 ? 'item pendente' : 'itens pendentes'}</Text>
          </View>
          <Text style={styles.summaryIcon}>▱</Text>
        </View>

        <View style={styles.addRow}>
          <TextInput
            onChangeText={setNewItem}
            onSubmitEditing={handleAddItem}
            placeholder="Adicionar um item..."
            placeholderTextColor="#8A918D"
            returnKeyType="done"
            style={styles.addInput}
            value={newItem}
          />
          <Pressable
            accessibilityLabel="Adicionar item"
            accessibilityRole="button"
            disabled={!newItem.trim()}
            onPress={handleAddItem}
            style={({ pressed }) => [
              styles.addButton,
              !newItem.trim() && styles.disabledButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>

        <View style={styles.toolsRow}>
          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              onChangeText={setSearch}
              placeholder="Buscar na lista"
              placeholderTextColor="#8A918D"
              style={styles.searchInput}
              value={search}
            />
          </View>
          <View style={styles.filters}>
            {(['all', 'pending', 'purchased'] as const).map((option) => {
              const labels = { all: 'Todos', pending: 'Faltam', purchased: 'Feitos' };
              return (
                <Pressable
                  key={option}
                  onPress={() => setFilter(option)}
                  style={[styles.filterButton, filter === option && styles.filterButtonActive]}
                >
                  <Text style={[styles.filterText, filter === option && styles.filterTextActive]}>
                    {labels[option]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <FlatList
          contentContainerStyle={styles.listContent}
          data={visibleItems}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✦</Text>
              <Text style={styles.emptyTitle}>{items.length ? 'Nada por aqui' : 'Sua lista está vazia'}</Text>
              <Text style={styles.emptyDescription}>
                {items.length ? 'Tente mudar o filtro ou a busca.' : 'Adicione o primeiro item para começar.'}
              </Text>
            </View>
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
      <StatusBar style="dark" />
    </View>
  );
}

export default function App() {
  return <ShoppingProvider><AppContent /></ShoppingProvider>;
}

function AppContent() {
  const { userName } = useShopping();
  return userName ? <ShoppingScreen /> : <LoginScreen />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8F5',
  },
  screen: {
    flex: 1,
    marginHorizontal: 'auto',
    maxWidth: 760,
    width: '100%',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 500,
    padding: 28,
    width: '100%',
    alignSelf: 'center',
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: '#D4EE58',
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    marginBottom: 46,
    width: 52,
  },
  brandMarkText: {
    color: '#17241D',
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 36,
  },
  eyebrow: {
    color: '#6B766F',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  loginTitle: {
    color: '#17241D',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 48,
  },
  loginDescription: {
    color: '#6B766F',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
    maxWidth: 360,
  },
  loginForm: {
    marginTop: 42,
  },
  inputLabel: {
    color: '#6B766F',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E8E1',
    borderRadius: 12,
    borderWidth: 1,
    color: '#17241D',
    fontSize: 16,
    height: 56,
    paddingHorizontal: 16,
  },
  passwordLabel: {
    marginTop: 16,
  },
  errorText: {
    color: '#B84C4C',
    fontSize: 13,
    marginTop: 10,
  },
  modeButton: {
    alignSelf: 'center',
    marginTop: 20,
    padding: 4,
  },
  modeText: {
    color: '#6B766F',
    fontSize: 13,
  },
  modeTextStrong: {
    color: '#17241D',
    fontWeight: '800',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#17241D',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    marginTop: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.4,
  },
  pressedButton: {
    opacity: 0.78,
  },
  loginFooter: {
    color: '#9AA39D',
    fontSize: 13,
    marginTop: 58,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 28,
    paddingBottom: 20,
  },
  greeting: {
    color: '#17241D',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoutButton: {
    borderColor: '#DDE4DB',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  logoutText: {
    color: '#526057',
    fontSize: 13,
    fontWeight: '700',
  },
  summary: {
    alignItems: 'center',
    backgroundColor: '#D4EE58',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 28,
    padding: 24,
  },
  summaryLabel: {
    color: '#486022',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  summaryNumber: {
    color: '#17241D',
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 54,
  },
  summaryText: {
    color: '#486022',
    fontSize: 14,
  },
  summaryIcon: {
    color: '#6F8B2B',
    fontSize: 64,
    fontWeight: '200',
    transform: [{ rotate: '-12deg' }],
  },
  addRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 28,
    marginTop: 22,
  },
  addInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E3E8E1',
    borderRadius: 12,
    borderWidth: 1,
    color: '#17241D',
    flex: 1,
    fontSize: 15,
    height: 52,
    paddingHorizontal: 16,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: '#17241D',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
  toolsRow: {
    gap: 12,
    marginHorizontal: 28,
    marginTop: 18,
  },
  searchWrapper: {
    alignItems: 'center',
    backgroundColor: '#EEF1EC',
    borderRadius: 10,
    flexDirection: 'row',
    height: 44,
    paddingHorizontal: 12,
  },
  searchIcon: {
    color: '#6B766F',
    fontSize: 25,
    marginRight: 8,
  },
  searchInput: {
    color: '#17241D',
    flex: 1,
    fontSize: 14,
    height: 44,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    borderColor: '#DDE4DB',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButtonActive: {
    backgroundColor: '#17241D',
    borderColor: '#17241D',
  },
  filterText: {
    color: '#6B766F',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 28,
    paddingTop: 18,
  },
  itemRow: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 10,
    minHeight: 64,
    paddingHorizontal: 16,
  },
  itemRowPressed: {
    backgroundColor: '#F0F3EE',
  },
  checkbox: {
    alignItems: 'center',
    borderColor: '#BEC9BE',
    borderRadius: 7,
    borderWidth: 1.5,
    height: 24,
    justifyContent: 'center',
    marginRight: 13,
    width: 24,
  },
  checkboxChecked: {
    backgroundColor: '#A8C73E',
    borderColor: '#A8C73E',
  },
  checkmark: {
    color: '#17241D',
    fontSize: 16,
    fontWeight: '800',
  },
  itemName: {
    color: '#17241D',
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  itemNamePurchased: {
    color: '#9AA39D',
    textDecorationLine: 'line-through',
  },
  itemAction: {
    color: '#9AA39D',
    fontSize: 11,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 54,
  },
  emptyIcon: {
    color: '#B7C4B1',
    fontSize: 28,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#34443A',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyDescription: {
    color: '#849088',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
});
