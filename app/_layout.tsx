import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DrinkTrackerProvider } from "@/contexts/DrinkTrackerContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: true,
          title: "Drinks & Units Tally",
          headerLargeTitle: false,
        }} 
      />
      <Stack.Screen 
        name="stats" 
        options={{ 
          headerShown: true,
          title: "Statistics",
          headerLargeTitle: false,
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          headerShown: true,
          title: "Settings",
          headerLargeTitle: false,
        }} 
      />
      <Stack.Screen 
        name="manage-drinks" 
        options={{ 
          headerShown: false,
          title: "Manage Drinks",
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <DrinkTrackerProvider>
            <GestureHandlerRootView style={styles.container}>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </DrinkTrackerProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
