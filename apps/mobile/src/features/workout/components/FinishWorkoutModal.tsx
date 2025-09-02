import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import {
  Sheet,
  YStack,
  XStack,
  H4,
  Button,
  Text,
  Card,
  Input,
  Select,
  Adapt,
  ScrollView,
} from 'tamagui';
import {
  Camera,
  Image as ImageIcon,
  Check,
  Clock,
  Trophy,
  Dumbbell,
  X,
} from '@tamagui/lucide-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import type {
  FinishWorkoutModalProps,
  FinishWorkoutData,
  WorkoutSummary,
} from '../types';

export function FinishWorkoutModal({
  isOpen,
  session,
  onClose,
  onComplete,
}: FinishWorkoutModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [description, setDescription] = useState('');
  const [selectedClubId, setSelectedClubId] = useState<string | undefined>();
  const [updateTemplate, setUpdateTemplate] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  // Calculate workout summary
  const workoutSummary: WorkoutSummary = useMemo(() => {
    const completedSets = session.exercises.reduce(
      (total, ex) => total + ex.sets.filter((set) => set.completed).length,
      0
    );

    const totalVolume = session.exercises.reduce(
      (total, ex) =>
        total +
        ex.sets.reduce(
          (exTotal, set) =>
            set.completed && set.weight && set.reps
              ? exTotal + set.weight * set.reps
              : exTotal,
          0
        ),
      0
    );

    const formatDate = (date: Date) => {
      const options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      };
      return date.toLocaleDateString('en-US', options);
    };

    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const durationInSeconds = Math.floor(
      (Date.now() - session.startedAt.getTime()) / 1000
    );

    return {
      duration: formatTime(durationInSeconds),
      volume: Math.round(totalVolume),
      exerciseCount: session.exercises.length,
      formattedDate: formatDate(new Date()),
      completedSets,
      exercises: session.exercises.map((ex) => ex.exercise.name),
    };
  }, [session]);

  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick image');
    }
  }, []);

  const takePhoto = useCallback(async () => {
    try {
      // Request camera permissions first
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera access is needed to take photos'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Error', 'Failed to take photo');
    }
  }, []);

  const handleComplete = useCallback(async () => {
    try {
      setIsCompleting(true);

      const finishData: FinishWorkoutData = {
        image: selectedImage,
        description: description.trim() || undefined,
        clubId: selectedClubId,
        updateTemplate,
        saveAsTemplate,
        templateName: templateName.trim() || undefined,
      };

      await onComplete(finishData);
    } catch {
      Alert.alert('Error', 'Failed to complete workout');
    } finally {
      setIsCompleting(false);
    }
  }, [
    selectedImage,
    description,
    selectedClubId,
    updateTemplate,
    saveAsTemplate,
    templateName,
    onComplete,
  ]);

  const handleClose = useCallback(() => {
    setSelectedImage(undefined);
    setDescription('');
    setSelectedClubId(undefined);
    setUpdateTemplate(false);
    setSaveAsTemplate(false);
    setTemplateName('');
    onClose();
  }, [onClose]);

  // Mock clubs data for now
  const mockClubs = [
    { id: 'club-1', name: 'Gym Buddies' },
    { id: 'club-2', name: 'Morning Warriors' },
    { id: 'club-3', name: 'Weekend Warriors' },
  ];

  return (
    <Sheet
      open={isOpen}
      onOpenChange={handleClose}
      modal
      snapPointsMode="percent"
      snapPoints={[100]}
      dismissOnSnapToBottom={false}
      disableDrag={true}
    >
      <Sheet.Overlay backgroundColor="rgba(0, 0, 0, 0.5)" />
      <Sheet.Frame
        backgroundColor="$background"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
        paddingBottom="$4"
      >
        <YStack flex={1}>
          {/* Header */}
          <XStack
            justifyContent="space-between"
            alignItems="center"
            padding="$4"
            paddingBottom="$3"
            borderBottomWidth={1}
            borderBottomColor="$gray4"
          >
            <H4>Complete Workout</H4>
            <Button
              size="$3"
              chromeless
              onPress={handleClose}
              icon={<X size={20} />}
              accessibilityLabel="Close modal"
            />
          </XStack>

          <ScrollView flex={1} showsVerticalScrollIndicator={false}>
            <YStack space="$4" padding="$4">
              {/* Workout Summary */}
              <Card
                backgroundColor="$green2"
                borderColor="$green6"
                borderWidth={1}
                padding="$4"
              >
                <YStack space="$3">
                  <Text fontSize="$5" fontWeight="600" color="$green12">
                    {session.name}
                  </Text>
                  <Text fontSize="$3" color="$green11">
                    {workoutSummary.formattedDate}
                  </Text>

                  <XStack space="$4" flexWrap="wrap">
                    <XStack space="$1" alignItems="center">
                      <Clock size={16} color="$green11" />
                      <Text fontSize="$3" color="$green11" fontWeight="500">
                        {workoutSummary.duration}
                      </Text>
                    </XStack>
                    <XStack space="$1" alignItems="center">
                      <Trophy size={16} color="$green11" />
                      <Text fontSize="$3" color="$green11" fontWeight="500">
                        {workoutSummary.volume} lbs
                      </Text>
                    </XStack>
                    <XStack space="$1" alignItems="center">
                      <Dumbbell size={16} color="$green11" />
                      <Text fontSize="$3" color="$green11" fontWeight="500">
                        {workoutSummary.exerciseCount} exercises
                      </Text>
                    </XStack>
                    <XStack space="$1" alignItems="center">
                      <Check size={16} color="$green11" />
                      <Text fontSize="$3" color="$green11" fontWeight="500">
                        {workoutSummary.completedSets} sets
                      </Text>
                    </XStack>
                  </XStack>

                  <YStack space="$2">
                    <Text fontSize="$3" fontWeight="600" color="$green12">
                      Exercises
                    </Text>
                    <Text fontSize="$3" color="$green11" lineHeight="$1">
                      {workoutSummary.exercises.join(' • ')}
                    </Text>
                  </YStack>
                </YStack>
              </Card>

              {/* Image Upload Section */}
              <Card
                backgroundColor="$gray1"
                borderColor="$gray4"
                borderWidth={1}
                padding="$4"
              >
                <YStack space="$3">
                  <Text fontSize="$4" fontWeight="600">
                    Add Photo
                  </Text>

                  {selectedImage ? (
                    <YStack space="$2" alignItems="center">
                      <Image
                        source={{ uri: selectedImage }}
                        style={{
                          width: 200,
                          height: 150,
                          borderRadius: 8,
                        }}
                        contentFit="cover"
                      />
                      <XStack space="$2">
                        <Button
                          size="$3"
                          variant="outlined"
                          onPress={pickImage}
                        >
                          Change Photo
                        </Button>
                        <Button
                          size="$3"
                          variant="outlined"
                          onPress={() => setSelectedImage(undefined)}
                        >
                          Remove
                        </Button>
                      </XStack>
                    </YStack>
                  ) : (
                    <XStack space="$2">
                      <Button
                        flex={1}
                        size="$3"
                        variant="outlined"
                        icon={<Camera size={16} />}
                        onPress={takePhoto}
                      >
                        Take Photo
                      </Button>
                      <Button
                        flex={1}
                        size="$3"
                        variant="outlined"
                        icon={<ImageIcon size={16} />}
                        onPress={pickImage}
                      >
                        Choose Photo
                      </Button>
                    </XStack>
                  )}
                </YStack>
              </Card>

              {/* Description */}
              <Card
                backgroundColor="$gray1"
                borderColor="$gray4"
                borderWidth={1}
                padding="$4"
              >
                <YStack space="$3">
                  <Text fontSize="$4" fontWeight="600">
                    Description
                  </Text>
                  <Input
                    placeholder="How did your workout go? (optional)"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    returnKeyType="done"
                    blurOnSubmit={true}
                    accessibilityLabel="Workout description"
                  />
                </YStack>
              </Card>

              {/* Share to Group */}
              <Card
                backgroundColor="$gray1"
                borderColor="$gray4"
                borderWidth={1}
                padding="$4"
              >
                <YStack space="$3">
                  <Text fontSize="$4" fontWeight="600">
                    Share to Group
                  </Text>
                  <Select
                    value={selectedClubId}
                    onValueChange={setSelectedClubId}
                  >
                    <Select.Trigger width="100%" iconAfter={undefined}>
                      <Select.Value placeholder="Select a group (optional)" />
                    </Select.Trigger>

                    <Adapt platform="touch">
                      <Select.Content zIndex={200000}>
                        <Select.ScrollUpButton />
                        <Select.Viewport minHeight={200}>
                          <Select.Group>
                            <Select.Label>Groups</Select.Label>
                            <Select.Item index={0} value="">
                              <Select.ItemText>Don't share</Select.ItemText>
                            </Select.Item>
                            {mockClubs.map((club, index) => (
                              <Select.Item
                                key={club.id}
                                index={index + 1}
                                value={club.id}
                              >
                                <Select.ItemText>{club.name}</Select.ItemText>
                              </Select.Item>
                            ))}
                          </Select.Group>
                        </Select.Viewport>
                        <Select.ScrollDownButton />
                      </Select.Content>
                    </Adapt>
                  </Select>
                </YStack>
              </Card>

              {/* Save as Template - for empty workouts */}
              {!session.templateId && session.exercises.length > 0 && (
                <Card
                  backgroundColor="$gray1"
                  borderColor="$gray4"
                  borderWidth={1}
                  padding="$4"
                >
                  <YStack space="$3">
                    <Text fontSize="$4" fontWeight="600">
                      Save as Template
                    </Text>
                    <YStack space="$2">
                      <XStack space="$3" alignItems="center">
                        <Button
                          size="$3"
                          variant="outlined"
                          backgroundColor={
                            saveAsTemplate ? '$blue9' : 'transparent'
                          }
                          borderColor="$blue6"
                          onPress={() => setSaveAsTemplate(true)}
                          flex={1}
                          accessibilityLabel="Save workout as template"
                        >
                          Save as Template
                        </Button>
                        <Button
                          size="$3"
                          variant="outlined"
                          backgroundColor={
                            !saveAsTemplate ? '$gray9' : 'transparent'
                          }
                          borderColor="$gray6"
                          onPress={() => setSaveAsTemplate(false)}
                          flex={1}
                          accessibilityLabel="Don't save as template"
                        >
                          Skip
                        </Button>
                      </XStack>
                      {saveAsTemplate && (
                        <Input
                          placeholder="Template name (e.g., 'Push Day')"
                          value={templateName}
                          onChangeText={setTemplateName}
                          accessibilityLabel="Template name"
                        />
                      )}
                      <Text fontSize="$2" color="$gray11" textAlign="left">
                        {saveAsTemplate
                          ? 'This workout will be saved as a reusable template'
                          : 'Workout will not be saved as a template'}
                      </Text>
                    </YStack>
                  </YStack>
                </Card>
              )}

              {/* Template Update */}
              {session.templateId && (
                <Card
                  backgroundColor="$gray1"
                  borderColor="$gray4"
                  borderWidth={1}
                  padding="$4"
                >
                  <YStack space="$3">
                    <Text fontSize="$4" fontWeight="600">
                      Template
                    </Text>
                    <YStack space="$2">
                      <XStack space="$3" alignItems="center">
                        <Button
                          size="$3"
                          variant="outlined"
                          backgroundColor={
                            updateTemplate ? '$blue9' : 'transparent'
                          }
                          borderColor="$blue6"
                          onPress={() => setUpdateTemplate(true)}
                          flex={1}
                          accessibilityLabel="Update template with changes"
                        >
                          Update Template
                        </Button>
                        <Button
                          size="$3"
                          variant="outlined"
                          backgroundColor={
                            !updateTemplate ? '$gray9' : 'transparent'
                          }
                          borderColor="$gray6"
                          onPress={() => setUpdateTemplate(false)}
                          flex={1}
                          accessibilityLabel="Keep original template"
                        >
                          Keep Original
                        </Button>
                      </XStack>
                      <Text fontSize="$2" color="$gray11" textAlign="left">
                        {updateTemplate
                          ? 'Template will be updated with any exercise changes you made'
                          : 'Template will remain unchanged'}
                      </Text>
                    </YStack>
                  </YStack>
                </Card>
              )}
            </YStack>
          </ScrollView>

          {/* Footer CTA */}
          <YStack
            padding="$4"
            backgroundColor="$background"
            borderTopWidth={1}
            borderTopColor="$gray4"
          >
            <Button
              size="$4"
              backgroundColor="$green9"
              onPress={handleComplete}
              disabled={isCompleting}
              accessibilityLabel="Complete workout"
            >
              <Text color="white" fontSize="$4" fontWeight="600">
                {isCompleting ? 'Completing...' : 'Complete Workout'}
              </Text>
            </Button>
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
