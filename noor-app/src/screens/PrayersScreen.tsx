import { StyleSheet, Text, View } from 'react-native';

export default function PrayersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prières</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
