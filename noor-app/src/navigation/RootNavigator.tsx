import { Ionicons } from '@expo/vector-icons';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import PrayersScreen from '../screens/PrayersScreen';
import EventsNavigator, { type EventsStackParamList } from './EventsNavigator';
import MarketplaceNavigator from './MarketplaceNavigator';
import MosquesNavigator from './MosquesNavigator';

export type RootTabParamList = {
  Prières: undefined;
  Mosquées: undefined;
  Événements: NavigatorScreenParams<EventsStackParamList>;
  Marketplace: undefined;
};

const TAB_ICONS: Record<keyof RootTabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Prières: { active: 'time', inactive: 'time-outline' },
  Mosquées: { active: 'business', inactive: 'business-outline' },
  Événements: { active: 'calendar', inactive: 'calendar-outline' },
  Marketplace: { active: 'storefront', inactive: 'storefront-outline' },
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerTitleAlign: 'center',
          tabBarActiveTintColor: '#0f5132',
          tabBarInactiveTintColor: '#888',
          tabBarIcon: ({ color, size, focused }) => {
            const icons = TAB_ICONS[route.name as keyof RootTabParamList];
            return <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Prières" component={PrayersScreen} />
        <Tab.Screen name="Mosquées" component={MosquesNavigator} options={{ headerShown: false }} />
        <Tab.Screen name="Événements" component={EventsNavigator} options={{ headerShown: false }} />
        <Tab.Screen name="Marketplace" component={MarketplaceNavigator} options={{ headerShown: false }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
