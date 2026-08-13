import {
  StyleSheet,
} from 'react-native';

export default StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 56,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: 14,
  },

  multilineContainer: {
    minHeight: 130,
    justifyContent: 'flex-start',
  },

  input: {
    width: '100%',
    fontSize: 16,
    paddingVertical: 14,
  },

  multilineInput: {
    minHeight: 120,
  },
});