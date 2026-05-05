import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { COLORS, SIZES, SHADOWS } from '../utils/constants';
import { AuthContext } from '../context/AuthContext';

const bgImage = require('../../assets/images/img_4.png');
const logo = require('../../assets/images/logo.svg');

WebBrowser.maybeCompleteAuthSession();

export const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { registerInitiate, googleSignIn, isLoading } = useContext(AuthContext);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: '422784466370-j6lfhsb1eglqbnf06116hbickririnit.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleBackendGoogleAuth(id_token);
    }
  }, [response]);

  const handleBackendGoogleAuth = async (idToken: string) => {
    try {
      setIsGoogleLoading(true);
      setError(null);
      await googleSignIn(idToken);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google Sign-In failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setError(null);
      await registerInitiate(email);
      // Navigate to Verify screen with the collected data
      navigation.navigate('VerifyOTP', { name, email, password });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    }
  };

  return (
    <View style={styles.root}>
      {/* Background Wallpaper */}
      <View style={StyleSheet.absoluteFill}>
        <Image source={bgImage} style={styles.bgImage} contentFit="cover" />
        <LinearGradient
          colors={['rgba(240, 238, 235, 0.4)', 'rgba(235, 232, 228, 0.7)', '#EAE6E1', '#E5E0DA']}
          locations={[0, 0.4, 0.7, 1]}
          style={styles.overlay}
        />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logoIcon} contentFit="contain" />
          </View>
        </View>

        <View style={styles.form}>
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#FF5252" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          <Input
            label="  Name"
            placeholder="Enter your full name"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Password"
            placeholder="Create a password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            }
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            }
          />
          
          <Button
            title="Sign Up"
            onPress={handleRegister}
            isLoading={isLoading}
            style={styles.registerButton}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <Button
            title="Continue with Google"
            variant="outline"
            icon={<Ionicons name="logo-google" size={20} color={COLORS.primary} />}
            onPress={() => promptAsync()}
            isLoading={isGoogleLoading}
            style={styles.googleButton}
          />

          <Button
            title="Already have an account? Log In"
            variant="ghost"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: SIZES.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: SIZES.xxl,
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
    ...SHADOWS.medium,
  },
  logoIcon: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: SIZES.sm,
  },
  registerButton: {
    marginTop: SIZES.sm,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dividerText: {
    marginHorizontal: SIZES.sm,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  googleButton: {
    marginBottom: SIZES.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    gap: 8,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 14,
    fontWeight: '500',
  },
});
