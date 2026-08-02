import { createNativeStackNavigator } from '@react-navigation/native-stack';

import EventDetailScreen from '../screens/EventDetailScreen';
import EventsScreen from '../screens/EventsScreen';
import NewEventScreen from '../screens/NewEventScreen';

export type EventsStackParamList = {
  EventsList: { mosqueId?: string } | undefined;
  EventDetail: { eventId: string };
  NewEvent: undefined;
};

const Stack = createNativeStackNavigator<EventsStackParamList>();

export default function EventsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: '#0f5132' },
        headerTintColor: '#fff',
      }}
    >
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
