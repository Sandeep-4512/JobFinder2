import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import JobDetailScreen from './screens/JobDetailScreen';
import PostJobScreen from './screens/PostJobScreen';
import ProfileScreen from './screens/ProfileScreen';
import ViewProfileScreen from './screens/ViewProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ApplicantDetailScreen from './screens/ApplicantDetailScreen';
import NotificationScreen from './screens/NotificationScreen';
import JobSearchScreen from './screens/JobSearchScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="JobDetail" component={JobDetailScreen} />
        <Stack.Screen name="PostJob" component={PostJobScreen} />
        <Stack.Screen name="ApplicantDetail" component={ApplicantDetailScreen} />
        <Stack.Screen name="ViewProfile" component={ViewProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="JobSearch" component={JobSearchScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}