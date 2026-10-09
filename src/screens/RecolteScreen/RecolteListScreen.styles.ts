import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6f7',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6f7',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: '#666',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  label: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },

  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    maxWidth: '55%',
    textAlign: 'right',
  },

  descriptionContainer: {
    marginTop: 16,
  },

  description: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },

  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 50,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  photo: {
    width: 180,
    height: 180,
    borderRadius: 10,
    marginRight: 12,
  },

  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },

  status: {
    fontSize: 18,
    fontWeight: '700',
  },
}
);
