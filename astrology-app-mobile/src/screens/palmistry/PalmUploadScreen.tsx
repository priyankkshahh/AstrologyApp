import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { AppDispatch, RootState } from '../../redux/store';
import { uploadPalmPhoto } from '../../redux/slices/palmistrySlice';
import { colors, spacing, typography } from '../../styles';

export const PalmUploadScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, user } = useSelector((state: RootState) => state.auth);
  const { uploading } = useSelector((state: RootState) => state.palmistry);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [handSide, setHandSide] = useState<'left' | 'right'>('right');

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photos to analyze your palm'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'We need access to your camera to take a palm photo'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage || !user) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    try {
      const result = await dispatch(
        uploadPalmPhoto({
          userId: user.id,
          imageUri: selectedImage,
          handSide,
        })
      ).unwrap();

      Alert.alert(
        'Success',
        'Your palm photo has been uploaded and is being analyzed',
        [{ text: 'OK', onPress: () => navigation.navigate('PalmAnalysis' as never) }]
      );
    } catch (error) {
      Alert.alert('Upload Failed', 'There was an error uploading your palm photo');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upload Palm Photo</Text>
        <Text style={styles.subtitle}>
          Take or select a clear photo of your palm for analysis
        </Text>
      </View>

      <View style={styles.guidelines}>
        <Text style={styles.guidelinesTitle}>Photo Guidelines:</Text>
        <Text style={styles.guideline}>• Use good lighting</Text>
        <Text style={styles.guideline}>• Keep hand steady</Text>
        <Text style={styles.guideline}>• Show entire palm clearly</Text>
        <Text style={styles.guideline}>• Minimum 1000x1000 pixels</Text>
      </View>

      <View style={styles.handSelection}>
        <Text style={styles.handSelectionTitle}>Which hand?</Text>
        <View style={styles.handButtons}>
          <TouchableOpacity
            style={[
              styles.handButton,
              handSide === 'left' && styles.selectedHandButton,
            ]}
            onPress={() => setHandSide('left')}
          >
            <Text style={[
              styles.handButtonText,
              handSide === 'left' && styles.selectedHandButtonText,
            ]}>Left Hand</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.handButton,
              handSide === 'right' && styles.selectedHandButton,
            ]}
            onPress={() => setHandSide('right')}
          >
            <Text style={[
              styles.handButtonText,
              handSide === 'right' && styles.selectedHandButtonText,
            ]}>Right Hand</Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectedImage ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={() => setSelectedImage(null)}
          >
            <Text style={styles.retakeButtonText}>Retake Photo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Text style={styles.buttonText}>📷 Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>🖼️ Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedImage && (
        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.uploadButtonText}>Upload for Analysis</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  guidelines: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  guidelinesTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  guideline: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  handSelection: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  handSelectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  handButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  handButton: {
    flex: 1,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedHandButton: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
  handButtonText: {
    ...typography.body,
    color: colors.text,
  },
  selectedHandButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: 'bold',
  },
  imageContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  previewImage: {
    width: 300,
    height: 300,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  retakeButton: {
    padding: spacing.md,
  },
  retakeButtonText: {
    ...typography.body,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  uploadButton: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    margin: spacing.lg,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: 'bold',
  },
});