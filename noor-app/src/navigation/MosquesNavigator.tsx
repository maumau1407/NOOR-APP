import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MosqueDetailScreen from '../screens/MosqueDetailScreen';
import MosquesScreen from '../screens/MosquesScreen';

export type MosquesStackParamList = {
  MosquesList: undefined;
  MosqueDetail: { mosqueId: string };
};

const Stack = createNativeStackNavigator<MosquesStackParamList>();

export default function MosquesNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: '#0f5132' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name="MosquesList" component={MosquesScreen} options={{ title: 'Mosquées' }} />
      <Stack.Screen name="MosqueDetail" component={MosqueDetailScreen} options={{ title: 'Détail' }} />
    </Stack.Navigator>
  );
}
