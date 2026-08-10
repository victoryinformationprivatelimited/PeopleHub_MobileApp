import { Provider } from "react-redux";
import { StatusBar } from "expo-status-bar";
import { store } from "./src/store";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <Provider store={store}>
      <RootNavigator />
      <StatusBar style="auto" />
    </Provider>
  );
}
