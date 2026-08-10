import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { checkExistingSession } from "../store/authSlice";
import type { RootStackParamList } from "./types";
import LoginScreen from "../screens/LoginScreen";
import ProfileListScreen from "../screens/ProfileListScreen";
import ProfileSectionScreen from "../screens/ProfileSectionScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, checked } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(checkExistingSession());
  }, []);

  if (!checked) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="ProfileList" component={ProfileListScreen} options={{ title: "Profile" }} />
            <Stack.Screen name="ProfileSection" component={ProfileSectionScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
