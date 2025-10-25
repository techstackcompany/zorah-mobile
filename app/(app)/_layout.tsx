import { Stack } from "expo-router";
import React from "react";

const AppLayout = () => {
  return <Stack screenOptions={{  headerBackButtonDisplayMode:'minimal', headerBackTitleStyle:{fontFamily:'NunitoSemibold'},  }} >
    <Stack.Screen name="(home)" options={{headerShown: false}}/>
    <Stack.Screen name="expense-planning"  options={{ title:'Expense Planning' }}/>
    <Stack.Screen name="add-expense"   options={{ title:'Add Expense' }}/>
    <Stack.Screen name="add-income"   options={{ title:'Add Income' }}/>
    </Stack>;
};

export default AppLayout;
