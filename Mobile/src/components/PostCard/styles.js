import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 18,
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },

  header: {
    width: '100%',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },

  username: {
    fontSize: 16,
    fontWeight: '700',
  },

  date: {
    fontSize: 13,
    marginTop: 2,
  },

  postImage: {
    width: '100%',
    height: 320,
  },

  content: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  description: {
    fontSize: 15,
    lineHeight: 22,
  },

  actions: {
    flexDirection: 'row',
    justifyContent:
      'space-around',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#ececec',
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
});
``