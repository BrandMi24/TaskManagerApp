/**
 * RegisterScreen.tsx — New user registration.
 *
 * Mirrors LoginScreen design with additional fields and
 * matching validation flow.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

type Props = NativeStackScreenProps<
  { Login: undefined; Register: undefined },
  'Register'
>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register, isLoading } = useAuth();
  const { theme } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleRegister = useCallback(async () => {
    setError(null);
    const err = await register({ name, email, password, confirmPassword });
    if (err) setError(err);
  }, [name, email, password, confirmPassword, register]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { backgroundColor: theme.colors.background },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Gradient Header ── */}
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500 }}
          >
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSub}>
              Start organising your life
            </Text>
          </MotiView>
        </LinearGradient>

        {/* ── Form Card ── */}
        <MotiView
          from={{ opacity: 0, translateY: 40 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 200 }}
          style={[
            styles.card,
            theme.shadow,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {error && (
            <View
              style={[
                styles.errorBox,
                { backgroundColor: theme.colors.danger + '15' },
              ]}
            >
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>
                {error}
              </Text>
            </View>
          )}

          {/* Name */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Full Name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="John Doe"
            placeholderTextColor={theme.colors.placeholder}
            value={name}
            onChangeText={setName}
            autoCorrect={false}
          />

          {/* Email */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Email
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="you@example.com"
            placeholderTextColor={theme.colors.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Password */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Password
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="Min. 6 characters"
            placeholderTextColor={theme.colors.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Confirm */}
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Confirm Password
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.inputBackground,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="Re-enter password"
            placeholderTextColor={theme.colors.placeholder}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Pressable
            onPress={handleRegister}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed || isLoading ? 0.8 : 1 },
            ]}
          >
            <LinearGradient
              colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.link}
          >
            <Text style={[styles.linkText, { color: theme.colors.textSecondary }]}>
              Already have an account?{' '}
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                Sign In
              </Text>
            </Text>
          </Pressable>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: 40 },
  header: {
    paddingTop: 80,
    paddingBottom: 48,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitle: { fontSize: 32, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  card: {
    marginTop: -24,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
  },
  errorBox: { padding: 12, borderRadius: 12, marginBottom: 16 },
  errorText: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1 },
  button: { marginTop: 24, borderRadius: 16, overflow: 'hidden' },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { fontSize: 14 },
});

export default RegisterScreen;
