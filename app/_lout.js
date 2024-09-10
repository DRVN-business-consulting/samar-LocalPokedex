import React from 'react';
import { Stack } from 'expo-router';


export default function PokemonLayout() {
  return (

        <Stack>
          <Stack.Screen
            name="settings"
            options={{
              title: 'Pokemon',
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="index"
            options={{
              title: 'Details',
              headerShown: false,
            }}
          />
        </Stack>
  );
}
