import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import PrayersScreen from '../screens/PrayersScreen';
import MarketplaceNavigator from './MarketplaceNavigator';
import MosquesNavigator from './MosquesNavigator';

export type RootTabParamList = {
  Prières: undefined;
  Mosquées: undefined;
  Marketplace: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
        <Tab.Screen name="Prières" component={PrayersScreen} />
        <Tab.Screen name="Mosquées" component={MosquesNavigator} options={{ headerShown: false }} />
        <Tab.Screen name="Marketplace" component={MarketplaceNavigator} options={{ headerShown: false }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
