import {
  StyleSheet,
} from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 50,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },

  label: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
    marginLeft: 4,
  },

  photoContainer: {
    alignItems: 'center',
    marginBottom: 26,
  },

  avatarContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    marginBottom: 14,
  },

  avatar: {
    width: '100%',
    height: '100%',
  },

  defaultAvatar: {
    width: 140,
    height: 140,
    transform: [
      {
        scale: 4.2,
      },
    ],
  },

  changePhotoButton: {
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 12,
  },

  changePhotoText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  cancelPhotoButton: {
    marginTop: 12,
    padding: 6,
  },

  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: -8,
    marginBottom: 14,
    marginRight: 4,
  },

  divider: {
    width: '100%',
    height: 1,
    marginTop: 14,
    marginBottom: 24,
  },

  helperText: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },

  passwordSection: {
    marginTop: 8,
  },
});