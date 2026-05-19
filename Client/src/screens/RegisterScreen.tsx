import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { COLORS, SIZES } from '../utils/constants';
import { AuthContext } from '../context/AuthContext';

const headerImage = require('../../assets/images/logo.svg');

WebBrowser.maybeCompleteAuthSession();

export const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { registerInitiate, googleSignIn } = useContext(AuthContext);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleBackendGoogleAuth(id_token);
    } else if (response && response.type !== 'dismiss') {
      // Clear loading if response was not success
      setIsGoogleLoading(false);
    }
  }, [response]);

  const handleGooglePress = async () => {
    try {
      setIsGoogleLoading(true);
      setError(null);
      const result = await promptAsync();
      if (result?.type !== 'success') {
        setIsGoogleLoading(false);
      }
    } catch (err) {
      setIsGoogleLoading(false);
    }
  };

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
      setIsRegisterLoading(true);
      await registerInitiate(email);
      navigation.navigate('VerifyOTP', { name, email, password });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsRegisterLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Image 
            source={headerImage} 
            style={styles.headerImage} 
            contentFit="cover"
          />

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Create Account</Text>
          </View>

          <View style={styles.form}>
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#FF5252" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <Input
                placeholder="John Doe"
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
                style={styles.input}
                containerStyle={{ marginBottom: 0 }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <Input
                placeholder="Example@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                containerStyle={{ marginBottom: 0 }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <Input
                placeholder="At least 8 characters"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                containerStyle={{ marginBottom: 0 }}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
                  </TouchableOpacity>
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <Input
                placeholder="Repeat your password"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
                containerStyle={{ marginBottom: 0 }}
              />
            </View>
            
            <Button
              title={isRegisterLoading ? "Creating Account..." : "Sign Up"}
              onPress={handleRegister}
              isLoading={isRegisterLoading}
              style={styles.signUpButton}
            />

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>Or sign up with</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity 
              style={[styles.googleButton, isGoogleLoading && { opacity: 0.5 }]} 
              onPress={handleGooglePress}
              disabled={isGoogleLoading}
              activeOpacity={0.8}
            >
              {isGoogleLoading ? (
                <ActivityIndicator color="#1E293B" style={{ marginRight: 8 }} />
              ) : (
                <Image 
                  source={require('../../assets/images/google_logo.png')} 
                  style={styles.googleIcon}
                />
              )}
              <Text style={styles.googleButtonText}>
                {isGoogleLoading ? "Connecting..." : "Google"}
              </Text>
            </TouchableOpacity>

            <View style={styles.footerLinks}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signInLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.copyrightContainer}>
            <Text style={styles.copyrightText}>© 2023 ALL RIGHTS RESERVED</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    padding: 24,
    flexGrow: 1,
  },
  headerImage: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 24,
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize:28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 52,
  },
  signUpButton: {
    backgroundColor: '#1E293B',
    height: 56,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#94A3B8',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 32,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  signInLink: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  copyrightContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 8,
  },
  copyrightText: {
    fontSize: 12,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
});

