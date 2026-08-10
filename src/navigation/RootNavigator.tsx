import { useEffect } from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, type NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { checkExistingSession } from "../store/authSlice";
import type { RootStackParamList, RootNavParamList, MainTabParamList } from "./types";
import { brand, neutral } from "../theme";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import ProfileListScreen from "../screens/ProfileListScreen";
import ProfileSectionScreen from "../screens/ProfileSectionScreen";
import AttendanceHomeScreen from "../screens/AttendanceHomeScreen";
import MarkAttendanceScreen from "../screens/MarkAttendanceScreen";
import PendingApprovalsScreen from "../screens/PendingApprovalsScreen";
import LeaveHomeScreen from "../screens/LeaveHomeScreen";
import LeaveRequestsScreen from "../screens/LeaveRequestsScreen";
import ApplyLeaveScreen from "../screens/ApplyLeaveScreen";
import PayrollHomeScreen from "../screens/PayrollHomeScreen";
import PayslipScreen from "../screens/PayslipScreen";
import ReimbursementsScreen from "../screens/ReimbursementsScreen";
import RequestReimbursementScreen from "../screens/RequestReimbursementScreen";
import CompanyHierarchyScreen from "../screens/CompanyHierarchyScreen";

const RootStack = createNativeStackNavigator<RootNavParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const headerOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: brand.solid },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "700" },
};

function HomeTabStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "PeopleHub" }} />
      <Stack.Screen name="MarkAttendance" component={MarkAttendanceScreen} options={{ title: "Mark Attendance" }} />
      <Stack.Screen name="PendingApprovals" component={PendingApprovalsScreen} options={{ title: "Pending Approvals" }} />
      <Stack.Screen name="ApplyLeave" component={ApplyLeaveScreen} options={{ title: "Apply for Leave" }} />
      <Stack.Screen name="Payslip" component={PayslipScreen} />
      <Stack.Screen name="RequestReimbursement" component={RequestReimbursementScreen} options={{ title: "Request Reimbursement" }} />
      <Stack.Screen name="CompanyHierarchy" component={CompanyHierarchyScreen} options={{ title: "Company Hierarchy" }} />
    </Stack.Navigator>
  );
}

function AttendanceTabStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="AttendanceHome" component={AttendanceHomeScreen} options={{ title: "Attendance & Roster" }} />
      <Stack.Screen name="MarkAttendance" component={MarkAttendanceScreen} options={{ title: "Mark Attendance" }} />
      <Stack.Screen name="PendingApprovals" component={PendingApprovalsScreen} options={{ title: "Pending Approvals" }} />
      <Stack.Screen name="LeaveHome" component={LeaveHomeScreen} options={{ title: "Leave" }} />
      <Stack.Screen name="LeaveRequests" component={LeaveRequestsScreen} />
      <Stack.Screen name="ApplyLeave" component={ApplyLeaveScreen} options={{ title: "Apply for Leave" }} />
    </Stack.Navigator>
  );
}

function PayrollTabStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="PayrollHome" component={PayrollHomeScreen} options={{ title: "Payroll" }} />
      <Stack.Screen name="Payslip" component={PayslipScreen} />
      <Stack.Screen name="Reimbursements" component={ReimbursementsScreen} options={{ title: "Reimbursements" }} />
      <Stack.Screen name="RequestReimbursement" component={RequestReimbursementScreen} options={{ title: "Request Reimbursement" }} />
    </Stack.Navigator>
  );
}

function ProfileTabStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="ProfileList" component={ProfileListScreen} options={{ title: "Profile" }} />
      <Stack.Screen name="ProfileSection" component={ProfileSectionScreen} />
      <Stack.Screen name="CompanyHierarchy" component={CompanyHierarchyScreen} options={{ title: "Company Hierarchy" }} />
    </Stack.Navigator>
  );
}

/** Plain-text tab icon substitutes — no icon library in this project (see theme.ts's badge-letter
 * pattern for the same reasoning). Active tab gets the brand color, inactive stays muted grey. */
function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return (
    <View>
      <Text style={{ fontSize: 18, color: focused ? brand.solid : neutral.textMuted }}>{symbol}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: brand.solid,
        tabBarInactiveTintColor: neutral.textMuted,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeTabStack}
        options={{ title: "Home", tabBarIcon: ({ focused }) => <TabIcon symbol="⌂" focused={focused} /> }}
      />
      <Tab.Screen
        name="AttendanceTab"
        component={AttendanceTabStack}
        options={{ title: "Attendance", tabBarIcon: ({ focused }) => <TabIcon symbol="🗓" focused={focused} /> }}
      />
      <Tab.Screen
        name="PayrollTab"
        component={PayrollTabStack}
        options={{ title: "Payroll", tabBarIcon: ({ focused }) => <TabIcon symbol="$" focused={focused} /> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileTabStack}
        options={{ title: "Profile", tabBarIcon: ({ focused }) => <TabIcon symbol="☺" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, checked } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(checkExistingSession());
  }, []);

  if (!checked) return null;

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainTabs} />
        ) : (
          <RootStack.Screen name="Login" component={LoginScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
