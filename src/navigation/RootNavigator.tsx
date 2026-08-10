import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, type NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { checkExistingSession } from "../store/authSlice";
import type { RootStackParamList } from "./types";
import { brand, moduleColor } from "../theme";
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

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Colors each module's header bar to match its Home-screen tile, so the accent carries through
 * from tap to screen instead of every header reading as the same flat default. */
function headerFor(solid: string): NativeStackNavigationOptions {
  return {
    headerStyle: { backgroundColor: solid },
    headerTintColor: "#fff",
    headerTitleStyle: { fontWeight: "700" },
  };
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
      <Stack.Navigator>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: "PeopleHub ESS", ...headerFor(brand.solid) }} />
            <Stack.Screen name="ProfileList" component={ProfileListScreen} options={{ title: "Profile", ...headerFor(moduleColor.profile.solid) }} />
            <Stack.Screen name="ProfileSection" component={ProfileSectionScreen} options={headerFor(moduleColor.profile.solid)} />
            <Stack.Screen name="AttendanceHome" component={AttendanceHomeScreen} options={{ title: "Attendance & Roster", ...headerFor(moduleColor.attendance.solid) }} />
            <Stack.Screen name="MarkAttendance" component={MarkAttendanceScreen} options={{ title: "Mark Attendance", ...headerFor(moduleColor.attendance.solid) }} />
            <Stack.Screen name="PendingApprovals" component={PendingApprovalsScreen} options={{ title: "Pending Approvals", ...headerFor(moduleColor.attendance.solid) }} />
            <Stack.Screen name="LeaveHome" component={LeaveHomeScreen} options={{ title: "Leave", ...headerFor(moduleColor.leave.solid) }} />
            <Stack.Screen name="LeaveRequests" component={LeaveRequestsScreen} options={headerFor(moduleColor.leave.solid)} />
            <Stack.Screen name="ApplyLeave" component={ApplyLeaveScreen} options={{ title: "Apply for Leave", ...headerFor(moduleColor.leave.solid) }} />
            <Stack.Screen name="PayrollHome" component={PayrollHomeScreen} options={{ title: "Payroll", ...headerFor(moduleColor.payroll.solid) }} />
            <Stack.Screen name="Payslip" component={PayslipScreen} options={headerFor(moduleColor.payroll.solid)} />
            <Stack.Screen name="Reimbursements" component={ReimbursementsScreen} options={{ title: "Reimbursements", ...headerFor(moduleColor.payroll.solid) }} />
            <Stack.Screen name="RequestReimbursement" component={RequestReimbursementScreen} options={{ title: "Request Reimbursement", ...headerFor(moduleColor.payroll.solid) }} />
            <Stack.Screen name="CompanyHierarchy" component={CompanyHierarchyScreen} options={{ title: "Company Hierarchy", ...headerFor(moduleColor.hierarchy.solid) }} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
