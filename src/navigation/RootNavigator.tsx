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
import LeaveHomeScreen from "../screens/LeaveHomeScreen";
import LeaveRequestsScreen from "../screens/LeaveRequestsScreen";
import ApplyLeaveScreen from "../screens/ApplyLeaveScreen";
import PayrollHomeScreen from "../screens/PayrollHomeScreen";
import PayslipScreen from "../screens/PayslipScreen";
import ReimbursementsScreen from "../screens/ReimbursementsScreen";
import RequestReimbursementScreen from "../screens/RequestReimbursementScreen";
import CompanyHierarchyScreen from "../screens/CompanyHierarchyScreen";

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
            <Stack.Screen name="LeaveHome" component={LeaveHomeScreen} options={{ title: "Leave" }} />
            <Stack.Screen name="LeaveRequests" component={LeaveRequestsScreen} />
            <Stack.Screen name="ApplyLeave" component={ApplyLeaveScreen} options={{ title: "Apply for Leave" }} />
            <Stack.Screen name="PayrollHome" component={PayrollHomeScreen} options={{ title: "Payroll" }} />
            <Stack.Screen name="Payslip" component={PayslipScreen} />
            <Stack.Screen name="Reimbursements" component={ReimbursementsScreen} options={{ title: "Reimbursements" }} />
            <Stack.Screen name="RequestReimbursement" component={RequestReimbursementScreen} options={{ title: "Request Reimbursement" }} />
            <Stack.Screen name="CompanyHierarchy" component={CompanyHierarchyScreen} options={{ title: "Company Hierarchy" }} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
