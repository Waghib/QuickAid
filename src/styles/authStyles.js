import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    backgroundColor: '#2B95E1',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontWeight: '700',
    letterSpacing: 2,
  },
  quickText: {
    color: '#FFFFFF',
  },
  tagline: {
    color: '#FFFFFF',
    opacity: 0.95,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: '5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  activeToggle: {
    flex: 1,
    backgroundColor: '#2B95E1',
    borderRadius: 8,
    alignItems: 'center',
  },
  inactiveToggle: {
    flex: 1,
    alignItems: 'center',
  },
  activeToggleText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  inactiveToggleText: {
    color: '#666666',
  },
  inputContainer: {
    padding: 20,
    gap: 15,
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  countryCodeText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: '3.5%',
    fontSize: 14,
    color: '#666666',
  },
  actionButton: {
    backgroundColor: '#2B95E1',
    marginHorizontal: '5%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  googleButtonText: {
    color: '#666666',
    fontSize: 14,
  },
  termsText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 12,
    marginTop: '5%',
    marginHorizontal: '5%',
  },
  inputError: {
    borderColor: '#FF0000',
  },
  errorText: {
    color: '#FF0000',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
  },
  disabledButton: {
    opacity: 0.7,
    backgroundColor: '#B0BEC5',
  },
}); 