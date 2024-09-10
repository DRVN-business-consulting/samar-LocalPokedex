import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SavePokemons from "./(tabs)/pokemon";
import Detail from "./details"; // Make sure to import your Detail screen

const Stack = createNativeStackNavigator();

const AppNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="pokemon" component={SavePokemons} />
    <Stack.Screen name="details" component={Detail} />
  </Stack.Navigator>
);

export default AppNavigator;
