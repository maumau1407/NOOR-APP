import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ListingDetailScreen from '../screens/ListingDetailScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import NewListingScreen from '../screens/NewListingScreen';

export type MarketplaceStackParamList = {
  MarketplaceList: undefined;
  ListingDetail: { listingId: string };
  NewListing: undefined;
};

const Stack = createNativeStackNavigator<MarketplaceStackParamList>();

export default function MarketplaceNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: '#0f5132' },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name="MarketplaceList" component={MarketplaceScreen} options={{ title: 'Marketplace' }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Annonce' }} />
      <Stack.Screen
        name="NewListing"
        component={NewListingScreen}
        options={{ title: 'Nouvelle annonce', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
