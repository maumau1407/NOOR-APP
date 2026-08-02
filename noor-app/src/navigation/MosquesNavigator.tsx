import { createNativeStackNavigator } from '@react-navigation/native-stack';

import EventDetailScreen from '../screens/EventDetailScreen';
import EventsScreen from '../screens/EventsScreen';
import MosqueDetailScreen from '../screens/MosqueDetailScreen';
import MosquesScreen from '../screens/MosquesScreen';
import NewEventScreen from '../screens/NewEventScreen';

export type MosquesStackParamList = {
  MosquesList: undefined;
  MosqueDetail: { mosqueId: string };
  EventsList: undefined;
  EventDetail: { eventId: string };
  NewEvent: undefined;
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
      <Stack.Screen name="EventsList" component={EventsScreen} options={{ title: 'Événements' }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Événement' }} />
      <Stack.Screen
        name="NewEvent"
        component={NewEventScreen}
        options={{ title: 'Nouvel événement', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
