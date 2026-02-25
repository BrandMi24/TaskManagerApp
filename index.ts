/**
 * Entry point — must import gesture-handler BEFORE anything else.
 * This is required by react-native-gesture-handler for proper gesture support.
 */
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);
