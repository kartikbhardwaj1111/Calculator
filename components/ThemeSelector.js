import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { themes } from '../styles/themes';

const ThemeSelector = ({ currentTheme, onThemeChange, visible, onClose }) => {
  const slideY = useSharedValue(visible ? 0 : 300);
  const opacity = useSharedValue(visible ? 1 : 0);

  React.useEffect(() => {
    slideY.value = withSpring(visible ? 0 : 300, {
      damping: 15,
      stiffness: 300,
    });
    opacity.value = withSpring(visible ? 1 : 0);
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: slideY.value }],
      opacity: opacity.value,
    };
  });

  const ThemePreview = ({ theme, isSelected, onPress }) => {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
      scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
      scale.value = withSpring(1);
    };

    const previewStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
      };
    });

    return (
      <Animated.View style={previewStyle}>
        <TouchableOpacity
          style={[styles.themePreview, isSelected && styles.selectedTheme]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <LinearGradient
            colors={theme.background}
            style={styles.previewGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.previewContent}>
              {/* Mini display */}
              <LinearGradient
                colors={theme.displayBackground}
                style={styles.miniDisplay}
              >
                <Text style={[styles.miniDisplayText, { color: theme.displayText }]}>
                  123.45
                </Text>
              </LinearGradient>

              {/* Mini buttons */}
              <View style={styles.miniButtons}>
                <LinearGradient
                  colors={theme.numberButton}
                  style={styles.miniButton}
                >
                  <Text style={[styles.miniButtonText, { color: theme.numberButtonText }]}>
                    7
                  </Text>
                </LinearGradient>
                <LinearGradient
                  colors={theme.operatorButton}
                  style={styles.miniButton}
                >
                  <Text style={[styles.miniButtonText, { color: theme.operatorButtonText }]}>
                    +
                  </Text>
                </LinearGradient>
                <LinearGradient
                  colors={theme.equalsButton}
                  style={styles.miniButton}
                >
                  <Text style={[styles.miniButtonText, { color: theme.equalsButtonText }]}>
                    =
                  </Text>
                </LinearGradient>
              </View>
            </View>
          </LinearGradient>

          <Text style={styles.themeName}>{theme.name}</Text>

          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.backdrop} onPress={onClose} />
      
      <Animated.View style={[styles.container, animatedStyle]}>
        <BlurView intensity={80} style={styles.blurContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Theme</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.themesContainer}
          >
            {Object.entries(themes).map(([key, theme]) => (
              <ThemePreview
                key={key}
                theme={theme}
                isSelected={currentTheme === key}
                onPress={() => {
                  onThemeChange(key);
                  onClose();
                }}
              />
            ))}
          </ScrollView>
        </BlurView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  blurContainer: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  themesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  themePreview: {
    width: 120,
    height: 160,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedTheme: {
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  previewGradient: {
    flex: 1,
    padding: 8,
  },
  previewContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  miniDisplay: {
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },
  miniDisplayText: {
    fontSize: 14,
    fontWeight: '300',
  },
  miniButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  themeName: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 4,
    paddingVertical: 2,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});

export default ThemeSelector;