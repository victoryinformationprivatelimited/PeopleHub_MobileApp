import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { checkExistingSession } from "../store/authSlice";
import type { RootStackParamList } from "./types";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileListScreen from "../screens/ProfileListScreen";
import ProfileSectionScreen from "../screens/ProfileSectionScreen";
import AttendanceHomeScreen from "../screens/AttendanceHomeScreen";
import MarkAttendanceScreen from "../screens/MarkAttendanceScreen";
import PendingApprovalsScreen from "../screens/PendingApprovalsScreen";

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
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: "PeopleHub ESS" }} />
            <Stack.Screen name="ProfileList" component={ProfileListScreen} options={{ title: "Profile" }} />
            <Stack.Screen name="ProfileSection" component={ProfileSectionScreen} />
            <Stack.Screen name="AttendanceHome" component={AttendanceHomeScreen} options={{ title: "Attendance & Roster" }} />
            <Stack.Screen name="MarkAttendance" component={MarkAttendanceScreen} options={{ title: "Mark Attendance" }} />
            <Stack.Screen name="PendingApprovals" component={PendingApprovalsScreen} options={{ title: "Pending Approvals" }} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
