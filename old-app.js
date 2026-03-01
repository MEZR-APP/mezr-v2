/*
 * BREATHFLOW CHANGELOG
 * v1.4.2 - Jan 28, 2026
 * Fixed: Pattern builder and delete modals now work within settings screen
 */

import { View, Text, TouchableOpacity, StyleSheet, Animated, TextInput, ScrollView, Modal, FlatList } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

const CATEGORIES = [
  { id: 'health', label: 'HEALTH', emoji: '🏃' },
  { id: 'wellness', label: 'WELLNESS', emoji: '😴' },
  { id: 'productivity', label: 'PRODUCTIVITY', emoji: '📝' },
  { id: 'finance', label: 'FINANCE', emoji: '💰' },
];

const ALL_MODULES = [
  { id: 'breath', label: 'BREATH', category: 'health' },
  { id: 'swim', label: 'SWIM', category: 'health' },
  { id: 'run', label: 'RUN', category: 'health' },
  { id: 'cycle', label: 'CYCLE', category: 'health' },
  { id: 'meditate', label: 'ZEN', category: 'wellness' },
];

const DEFAULT_PATTERNS = [
  {
    id: 'basic',
    name: 'Basic',
    inhaleDuration: 2500,
    exhaleDuration: 3000,
    breathCycles: 5,
    hold1Duration: 10,
    hold2Duration: 0,
    restDuration: 5,
    sessions: 3,
    isDefault: true
  },
  {
    id: 'sleep',
    name: 'Sleep',
    inhaleDuration: 4000,
    exhaleDuration: 8000,
    breathCycles: 4,
    hold1Duration: 7,
    hold2Duration: 0,
    restDuration: 0,
    sessions: 4,
    isDefault: true
  },
  {
    id: 'relaxation',
    name: 'Relaxation',
    inhaleDuration: 4000,
    exhaleDuration: 6000,
    breathCycles: 10,
    hold1Duration: 5,
    hold2Duration: 0,
    restDuration: 3,
    sessions: 3,
    isDefault: true
  }
];

const MODULE_SOUNDS = {
  breath: {
    inhale: { url: 'https://assets.mixkit.co/active_storage/sfx/1212/1212-preview.mp3', pitch: 1.1 },
    exhale: { url: 'https://assets.mixkit.co/active_storage/sfx/1212/1212-preview.mp3', pitch: 0.9 },
    hold: { url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', pitch: 1.0 },
    rest: { url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', pitch: 0.8 }
  },
  swim: {
    stroke: { url: 'https://assets.mixkit.co/active_storage/sfx/2504/2504-preview.mp3', pitch: 1.0 }
  },
  meditate: {
    bell: { url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', pitch: 1.0 }
  },
  run: {
    footstep: { url: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', pitch: 1.0 }
  },
  cycle: {
    pedal: { url: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', pitch: 1.0 }
  }
};

export default function App() {
  const [currentCategory, setCurrentCategory] = useState('health');
  const [currentModule, setCurrentModule] = useState('breath');
  const [showSettings, setShowSettings] = useState(false);
  const [showModulePicker, setShowModulePicker] = useState(false);
  const [showPatternBuilder, setShowPatternBuilder] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [patternToDelete, setPatternToDelete] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const mainAnim = useRef(new Animated.Value(1)).current;
  const [history, setHistory] = useState([]);

  const [breathPatterns, setBreathPatterns] = useState(DEFAULT_PATTERNS);
  const [selectedPatternId, setSelectedPatternId] = useState('basic');
  const [editingPattern, setEditingPattern] = useState(null);

  const [patternName, setPatternName] = useState('');
  const [inhaleSec, setInhaleSec] = useState('2.5');
  const [exhaleSec, setExhaleSec] = useState('3');
  const [cycles, setCycles] = useState('5');
  const [hold1Sec, setHold1Sec] = useState('10');
  const [hold2Sec, setHold2Sec] = useState('0');
  const [restSec, setRestSec] = useState('5');
  const [sessionCount, setSessionCount] = useState('3');

  const [phase, setPhase] = useState('ready');
  const [breathCount, setBreathCount] = useState(0);
  const [currentSessionNum, setCurrentSessionNum] = useState(0);
  const [timer, setTimer] = useState(0);
  const [subPhase, setSubPhase] = useState('');

  const [laps, setLaps] = useState(0);
  const [swimTime, setSwimTime] = useState(0);
  const [targetLaps, setTargetLaps] = useState('10');
  const [manualDistance, setManualDistance] = useState('');
  const [manualTime, setManualTime] = useState('');
  const [manualLaps, setManualLaps] = useState('');
  const [medTime, setMedTime] = useState(600);
  const [medInput, setMedInput] = useState('10');
  const [targetDistance, setTargetDistance] = useState('5');
  const [targetDuration, setTargetDuration] = useState('30');
  const [cycleDistance, setCycleDistance] = useState('10');
  const [cycleDuration, setCycleDuration] = useState('45');

  const filteredModules = ALL_MODULES.filter(m => m.category === currentCategory);
  const currentPattern = breathPatterns.find(p => p.id === selectedPatternId) || breathPatterns[0];

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: false,
    });
    loadBreathPatterns();
  }, []);

  const loadBreathPatterns = async () => {
    try {
      const saved = await AsyncStorage.getItem('breath_patterns');
      if (saved) {
        const custom = JSON.parse(saved);
        setBreathPatterns([...DEFAULT_PATTERNS, ...custom]);
      }
    } catch (e) {
      console.log('Pattern load error');
    }
  };

  const saveBreathPatterns = async (patterns) => {
    try {
      const customPatterns = patterns.filter(p => !p.isDefault);
      await AsyncStorage.setItem('breath_patterns', JSON.stringify(customPatterns));
    } catch (e) {
      console.log('Pattern save error');
    }
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const playSound = useCallback(async (soundConfig) => {
    if (isMuted || !soundConfig) return;
    
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: soundConfig.url },
        { 
          shouldPlay: true, 
          volume: 0.6,
          rate: soundConfig.pitch || 1.0,
          shouldCorrectPitch: true
        }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Sound error:', error);
    }
  }, [isMuted]);

  const loadHistory = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem('app_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) { 
      console.log("Storage error"); 
    }
  }, []);

  useEffect(() => { 
    loadHistory(); 
  }, [loadHistory]);

  const logActivity = useCallback(async (type, metadata = {}) => {
    try {
      const saved = await AsyncStorage.getItem('app_history');
      const currentHistory = saved ? JSON.parse(saved) : [];
      const newHistory = [...currentHistory, { 
        type, 
        date: new Date().toISOString(),
        ...metadata 
      }];
      setHistory(newHistory);
      await AsyncStorage.setItem('app_history', JSON.stringify(newHistory));
    } catch (e) { 
      console.log("Save error"); 
    }
  }, []);

  const saveManualSession = () => {
    if (currentModule === 'swim') {
      const distance = parseFloat(manualDistance) || 0;
      const time = parseFloat(manualTime) || 0;
      const lapCount = parseInt(manualLaps) || 0;
      
      if (distance > 0 || time > 0 || lapCount > 0) {
        logActivity('swim', { distance, time, laps: lapCount, manual: true });
        setManualDistance('');
        setManualTime('');
        setManualLaps('');
        showToastMessage('Swim session saved! 🏊');
      } else {
        showToastMessage('Please enter at least one value');
      }
    }
  };

  const createNewPattern = () => {
    setEditingPattern(null);
    setPatternName('');
    setInhaleSec('2.5');
    setExhaleSec('3');
    setCycles('5');
    setHold1Sec('10');
    setHold2Sec('0');
    setRestSec('5');
    setSessionCount('3');
    setShowPatternBuilder(true);
  };

  const editPattern = (pattern) => {
    if (pattern.isDefault) {
      showToastMessage('Cannot edit default patterns');
      return;
    }
    setEditingPattern(pattern);
    setPatternName(pattern.name);
    setInhaleSec((pattern.inhaleDuration / 1000).toString());
    setExhaleSec((pattern.exhaleDuration / 1000).toString());
    setCycles(pattern.breathCycles.toString());
    setHold1Sec(pattern.hold1Duration.toString());
    setHold2Sec(pattern.hold2Duration.toString());
    setRestSec(pattern.restDuration.toString());
    setSessionCount(pattern.sessions.toString());
    setShowPatternBuilder(true);
  };

  const savePattern = () => {
    if (!patternName.trim()) {
      showToastMessage('Please enter a pattern name');
      return;
    }

    const newPattern = {
      id: editingPattern?.id || `custom-${Date.now()}`,
      name: patternName.trim(),
      inhaleDuration: parseFloat(inhaleSec) * 1000 || 2500,
      exhaleDuration: parseFloat(exhaleSec) * 1000 || 3000,
      breathCycles: parseInt(cycles) || 5,
      hold1Duration: parseInt(hold1Sec) || 0,
      hold2Duration: parseInt(hold2Sec) || 0,
      restDuration: parseInt(restSec) || 0,
      sessions: parseInt(sessionCount) || 3,
      isDefault: false
    };

    let updatedPatterns;
    if (editingPattern) {
      updatedPatterns = breathPatterns.map(p => p.id === editingPattern.id ? newPattern : p);
    } else {
      updatedPatterns = [...breathPatterns, newPattern];
      setSelectedPatternId(newPattern.id);
    }

    setBreathPatterns(updatedPatterns);
    saveBreathPatterns(updatedPatterns);
    setShowPatternBuilder(false);
    showToastMessage(`Pattern ${editingPattern ? 'updated' : 'created'}! ✓`);
  };

  const confirmDeletePattern = (patternId) => {
    const pattern = breathPatterns.find(p => p.id === patternId);
    if (pattern?.isDefault) {
      showToastMessage('Cannot delete default patterns');
      return;
    }
    setPatternToDelete(pattern);
    setShowDeleteConfirm(true);
  };

  const executeDeletePattern = () => {
    if (!patternToDelete) return;
    
    const updated = breathPatterns.filter(p => p.id !== patternToDelete.id);
    setBreathPatterns(updated);
    saveBreathPatterns(updated);
    if (selectedPatternId === patternToDelete.id) {
      setSelectedPatternId('basic');
    }
    setShowDeleteConfirm(false);
    setPatternToDelete(null);
    showToastMessage('Pattern deleted');
  };

  useEffect(() => {
    if (currentModule !== 'breath' || !isActive || !currentPattern) return;

    let timeout;
    let interval;

    const pattern = currentPattern;
    const totalSessions = pattern.sessions;

    if (phase === 'ready') {
      setSubPhase('cycles');
      setPhase('inhale');
    }

    if (subPhase === 'cycles') {
      if (phase === 'inhale') {
        playSound(MODULE_SOUNDS.breath.inhale);
        Animated.timing(mainAnim, { 
          toValue: 1.6, 
          duration: pattern.inhaleDuration, 
          useNativeDriver: true 
        }).start();
        timeout = setTimeout(() => setPhase('exhale'), pattern.inhaleDuration);
      } 
      else if (phase === 'exhale') {
        playSound(MODULE_SOUNDS.breath.exhale);
        Animated.timing(mainAnim, { 
          toValue: 1, 
          duration: pattern.exhaleDuration, 
          useNativeDriver: true 
        }).start();
        timeout = setTimeout(() => {
          const nextBreath = breathCount + 1;
          if (nextBreath >= pattern.breathCycles) {
            if (pattern.hold1Duration > 0) {
              setSubPhase('hold1');
              setPhase('hold');
              setTimer(pattern.hold1Duration);
              playSound(MODULE_SOUNDS.breath.hold);
            } else if (pattern.hold2Duration > 0) {
              setSubPhase('singleInhale');
              setPhase('inhale');
            } else {
              completeSession();
            }
            setBreathCount(0);
          } else {
            setBreathCount(nextBreath);
            setPhase('inhale');
          }
        }, pattern.exhaleDuration);
      }
    }

    else if (subPhase === 'hold1' && phase === 'hold') {
      interval = setInterval(() => {
        setTimer(p => {
          if (p <= 1) {
            clearInterval(interval);
            if (pattern.hold2Duration > 0) {
              setSubPhase('singleInhale');
              setPhase('inhale');
            } else {
              completeSession();
            }
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    }

    else if (subPhase === 'singleInhale' && phase === 'inhale') {
      playSound(MODULE_SOUNDS.breath.inhale);
      Animated.timing(mainAnim, { 
        toValue: 1.6, 
        duration: pattern.inhaleDuration, 
        useNativeDriver: true 
      }).start();
      timeout = setTimeout(() => {
        setSubPhase('hold2');
        setPhase('hold');
        setTimer(pattern.hold2Duration);
        playSound(MODULE_SOUNDS.breath.hold);
      }, pattern.inhaleDuration);
    }

    else if (subPhase === 'hold2' && phase === 'hold') {
      interval = setInterval(() => {
        setTimer(p => {
          if (p <= 1) {
            clearInterval(interval);
            setSubPhase('singleExhale');
            setPhase('exhale');
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    }

    else if (subPhase === 'singleExhale' && phase === 'exhale') {
      playSound(MODULE_SOUNDS.breath.exhale);
      Animated.timing(mainAnim, { 
        toValue: 1, 
        duration: pattern.exhaleDuration, 
        useNativeDriver: true 
      }).start();
      timeout = setTimeout(() => {
        completeSession();
      }, pattern.exhaleDuration);
    }

    else if (subPhase === 'rest' && phase === 'rest') {
      interval = setInterval(() => {
        setTimer(p => {
          if (p <= 1) {
            clearInterval(interval);
            setSubPhase('cycles');
            setPhase('inhale');
            setBreathCount(0);
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    }

    function completeSession() {
      const nextSession = currentSessionNum + 1;
      if (nextSession >= totalSessions) {
        setPhase('complete');
        setIsActive(false);
        logActivity('breath', { pattern: pattern.name });
        playSound(MODULE_SOUNDS.breath.hold);
        showToastMessage(`${pattern.name} complete! 💨`);
      } else {
        setCurrentSessionNum(nextSession);
        if (pattern.restDuration > 0) {
          setSubPhase('rest');
          setPhase('rest');
          setTimer(pattern.restDuration);
          playSound(MODULE_SOUNDS.breath.rest);
        } else {
          setSubPhase('cycles');
          setPhase('inhale');
          setBreathCount(0);
        }
      }
    }

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [isActive, phase, subPhase, currentModule, breathCount, currentSessionNum, currentPattern, mainAnim, playSound, logActivity]);

  useEffect(() => {
    let interval;
    if (isActive && currentModule === 'swim') {
      interval = setInterval(() => setSwimTime(p => p + 1), 1000);
    } else if (isActive && currentModule === 'meditate') {
      interval = setInterval(() => {
        setMedTime(p => {
          if (p <= 1) { 
            setIsActive(false); 
            logActivity('meditate'); 
            playSound(MODULE_SOUNDS.meditate.bell); 
            return 0; 
          }
          return p - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, currentModule, logActivity, playSound]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const resetAll = () => {
    setPhase('ready');
    setSubPhase('');
    setBreathCount(0);
    setCurrentSessionNum(0);
    setTimer(0);
    setLaps(0);
    setSwimTime(0);
    mainAnim.setValue(1);
    setIsActive(false);
  };

  const getPhaseDisplay = () => {
    if (subPhase === 'hold1' || subPhase === 'hold2') return `HOLD ${timer}`;
    if (subPhase === 'rest') return `REST ${timer}`;
    if (subPhase === 'singleInhale') return 'INHALE';
    if (subPhase === 'singleExhale') return 'EXHALE';
    return phase.toUpperCase();
  };

  const getProgressDisplay = () => {
    if (subPhase === 'cycles') {
      return `BREATH ${breathCount + 1}/${currentPattern.breathCycles} • SESSION ${currentSessionNum + 1}/${currentPattern.sessions}`;
    }
    return `SESSION ${currentSessionNum + 1}/${currentPattern.sessions}`;
  };

  const renderDeleteConfirmModal = () => (
    <Modal visible={showDeleteConfirm} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.deleteConfirmContainer}>
          <Text style={styles.deleteConfirmTitle}>DELETE PATTERN</Text>
          <Text style={styles.deleteConfirmMessage}>
            Delete "{patternToDelete?.name}"?
          </Text>
          <View style={styles.deleteConfirmButtons}>
            <TouchableOpacity 
              style={styles.deleteConfirmBtnCancel}
              onPress={() => {
                setShowDeleteConfirm(false);
                setPatternToDelete(null);
              }}
            >
              <Text style={styles.deleteConfirmBtnCancelText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteConfirmBtnDelete}
              onPress={executeDeletePattern}
            >
              <Text style={styles.deleteConfirmBtnDeleteText}>DELETE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderModulePicker = () => (
    <Modal visible={showModulePicker} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerTitle}>
            {CATEGORIES.find(c => c.id === currentCategory)?.label}
          </Text>
          <FlatList 
            data={filteredModules}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.pickerItem} 
                onPress={() => {
                  setCurrentModule(item.id);
                  setShowModulePicker(false);
                  resetAll();
                }}
              >
                <Text style={[styles.pickerText, currentModule === item.id && styles.activePickerText]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Coming soon...</Text>
            }
          />
          <TouchableOpacity onPress={() => setShowModulePicker(false)} style={styles.closePicker}>
            <Text style={styles.closePickerText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderPatternBuilder = () => (
    <Modal visible={showPatternBuilder} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.builderContainer}>
          <ScrollView 
            contentContainerStyle={styles.builderScroll}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.builderTitle}>
              {editingPattern ? 'EDIT PATTERN' : 'NEW PATTERN'}
            </Text>

            <View style={styles.builderItem}>
              <Text style={styles.builderLabel}>Pattern Name</Text>
              <TextInput 
                style={styles.builderInput} 
                value={patternName}
                onChangeText={setPatternName}
                placeholder="Morning Breath"
                placeholderTextColor="#333"
              />
            </View>

            <Text style={styles.builderSection}>TIMING</Text>

            <View style={styles.builderItem}>
              <Text style={styles.builderLabel}>Inhale (seconds)</Text>
              <TextInput 
                style={styles.builderInput} 
                value={inhaleSec}
                onChangeText={setInhaleSec}
                keyboardType="decimal-pad"
                placeholder="2.5"
                placeholderTextColor="#333"
              />
            </View>

            <View style={styles.builderItem}>
              <Text style={styles.builderLabel}>Exhale (seconds)</Text>
              <TextInput 
                style={styles.builderInput} 
                value={exhaleSec}
                onChangeText={setExhaleSec}
                keyboardType="decimal-pad"
                placeholder="3"
                placeholderTextColor="#333"
              />
            </View>

            <Text style={styles.builderSection}>CIRCUIT</Text>

            <View style={styles.builderItem}>
              <Text style={styles.builderLabel}>Breath Cycles</Text>
              <TextInput 
                style={styles.builderInput} 
                value={cycles}
                onChangeText={setCycles}
                keyboardType="numeric"
                placeholder="25"
                placeholderTextColor="#333"
              />
            </View>

            <View style={styles.builderItem}>
              <Text style={styles.builderLabel}>Hold After Cycles (seconds, 0 to skip)</Text>
              <TextInput 
                style={styles.builderInput} 
                value={hold1Sec}
                onChangeText={setHold1Sec}
                keyboardType="numeric"
                placeholder="90"
                placeholderTextColor="#333"
              />
            </View>

            <View style={styles.builderItem}>
              <Text style={styles.builderLabel}>Hold After Inhale (seconds, 0 to skip)</Text>
              <TextInput 
                style={styles.builderInput} 
                value={hold2Sec}
                onChangeText={setHold2Sec}
                keyboardType="numeric"
                placeholder="15"
                placeholderTextColor="#333"
              />
            </View>

            <View style={styles.builderItem}>
              <Text style={styles.builderLabel}>Rest Between Sessions (seconds, 0 to skip)</Text>
              <TextInput 
                style={styles.builderInput} 
                value={restSec}
                onChangeText={setRestSec}
                keyboardType="numeric"
                placeholder="5"
                placeholderTextColor="#333"
              />
            </View>

            <View style={styles.builderItem}>
              <Text style={styles.builderLabel}>Number of Sessions</Text>
              <TextInput 
                style={styles.builderInput} 
                value={sessionCount}
                onChangeText={setSessionCount}
                keyboardType="numeric"
                placeholder="3"
                placeholderTextColor="#333"
              />
            </View>

            <View style={styles.builderButtons}>
              <TouchableOpacity 
                style={styles.builderBtnSecondary}
                onPress={() => setShowPatternBuilder(false)}
              >
                <Text style={styles.builderBtnSecondaryText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.builderBtnPrimary}
                onPress={savePattern}
              >
                <Text style={styles.builderBtnPrimaryText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (showSettings) {
    const stats = {
      breath: history.filter(i => i.type === 'breath').length,
      swim: history.filter(i => i.type === 'swim').length,
      med: history.filter(i => i.type === 'meditate').length,
    };

    return (
      <View style={styles.container}>
        {/* MODALS MOVED INSIDE SETTINGS */}
        {renderPatternBuilder()}
        {renderDeleteConfirmModal()}
        
        <ScrollView contentContainerStyle={styles.settingsScroll}>
          <Text style={styles.settingsTitle}>{currentModule.toUpperCase()} SETTINGS</Text>
          
          {currentModule === 'breath' && (
            <View style={{width: '100%', alignItems: 'center'}}>
              <Text style={[styles.settingsTitle, {marginBottom: 15}]}>BREATHING PATTERNS</Text>
              
              {breathPatterns.map(pattern => (
                <View key={pattern.id} style={styles.patternCard}>
                  <TouchableOpacity 
                    style={{flex: 1}}
                    onPress={() => setSelectedPatternId(pattern.id)}
                  >
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                      <View style={{flex: 1}}>
                        <Text style={[
                          styles.patternName,
                          selectedPatternId === pattern.id && styles.patternNameActive
                        ]}>
                          {pattern.name}
                        </Text>
                        <Text style={styles.patternDetails}>
                          {pattern.breathCycles} cycles • {pattern.sessions} sessions
                        </Text>
                      </View>
                      {selectedPatternId === pattern.id && (
                        <Text style={styles.activeIndicator}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                  
                  {!pattern.isDefault && (
                    <View style={{flexDirection: 'row', marginTop: 10}}>
                      <TouchableOpacity 
                        onPress={() => editPattern(pattern)}
                        style={styles.miniButton}
                      >
                        <Text style={styles.miniButtonText}>EDIT</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => confirmDeletePattern(pattern.id)}
                        style={[styles.miniButton, {marginLeft: 10, backgroundColor: '#1A0000'}]}
                      >
                        <Text style={[styles.miniButtonText, {color: '#FF4444'}]}>DELETE</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}

              <TouchableOpacity 
                style={[styles.button, {marginTop: 20, backgroundColor: '#1A1A1A'}]}
                onPress={createNewPattern}
              >
                <Text style={[styles.buttonText, {color: '#FFF'}]}>+ NEW PATTERN</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentModule === 'swim' && (
            <View style={{width: '100%', alignItems: 'center'}}>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Target Laps</Text>
                <TextInput 
                  style={styles.input} 
                  value={targetLaps} 
                  onChangeText={setTargetLaps} 
                  keyboardType="numeric"
                  placeholder="10"
                  placeholderTextColor="#333"
                />
              </View>

              <Text style={[styles.settingsTitle, {marginTop: 30, marginBottom: 15}]}>
                LOG MANUAL SESSION
              </Text>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Distance (meters)</Text>
                <TextInput 
                  style={styles.input} 
                  value={manualDistance} 
                  onChangeText={setManualDistance} 
                  keyboardType="numeric"
                  placeholder="500"
                  placeholderTextColor="#333"
                />
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Time (minutes)</Text>
                <TextInput 
                  style={styles.input} 
                  value={manualTime} 
                  onChangeText={setManualTime} 
                  keyboardType="numeric"
                  placeholder="25"
                  placeholderTextColor="#333"
                />
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Laps Completed</Text>
                <TextInput 
                  style={styles.input} 
                  value={manualLaps} 
                  onChangeText={setManualLaps} 
                  keyboardType="numeric"
                  placeholder="20"
                  placeholderTextColor="#333"
                />
              </View>

              <TouchableOpacity 
                style={[styles.button, {marginTop: 20, backgroundColor: '#1A1A1A'}]} 
                onPress={saveManualSession}
              >
                <Text style={[styles.buttonText, {color: '#FFF'}]}>SAVE SESSION</Text>
              </TouchableOpacity>
            </View>
          )}

          {currentModule === 'meditate' && (
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Duration (minutes)</Text>
              <TextInput 
                style={styles.input} 
                value={medInput} 
                onChangeText={(t) => {
                  setMedInput(t); 
                  setMedTime((parseInt(t)||0)*60);
                }} 
                keyboardType="numeric"
                placeholder="10"
                placeholderTextColor="#333"
              />
            </View>
          )}

          {(currentModule === 'run' || currentModule === 'cycle') && (
            <View style={{width: '100%', alignItems: 'center'}}>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Target Distance (km)</Text>
                <TextInput 
                  style={styles.input} 
                  value={currentModule === 'run' ? targetDistance : cycleDistance} 
                  onChangeText={currentModule === 'run' ? setTargetDistance : setCycleDistance} 
                  keyboardType="numeric"
                  placeholder="5"
                  placeholderTextColor="#333"
                />
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Target Duration (min)</Text>
                <TextInput 
                  style={styles.input} 
                  value={currentModule === 'run' ? targetDuration : cycleDuration} 
                  onChangeText={currentModule === 'run' ? setTargetDuration : setCycleDuration} 
                  keyboardType="numeric"
                  placeholder="30"
                  placeholderTextColor="#333"
                />
              </View>
              <Text style={styles.comingSoonText}>Full tracking coming soon</Text>
            </View>
          )}

          <Text style={[styles.settingsTitle, {marginTop: 40}]}>LIFETIME TOTALS</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{stats.breath}</Text>
              <Text style={styles.statLabel}>BREATH</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{stats.swim}</Text>
              <Text style={styles.statLabel}>SWIM</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{stats.med}</Text>
              <Text style={styles.statLabel}>ZEN</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, {marginTop: 20}]} 
            onPress={() => setShowSettings(false)}
          >
            <Text style={styles.buttonText}>DONE</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderModulePicker()}
      
      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
      
      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryTab,
                currentCategory === cat.id && styles.categoryTabActive
              ]}
              onPress={() => {
                if (!isActive) {
                  setCurrentCategory(cat.id);
                  const firstModule = ALL_MODULES.find(m => m.category === cat.id);
                  if (firstModule) {
                    setCurrentModule(firstModule.id);
                    resetAll();
                  }
                }
              }}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={[
                styles.categoryText,
                currentCategory === cat.id && styles.categoryTextActive
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.topHeader}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity 
            onPress={() => !isActive && setShowModulePicker(true)} 
            style={styles.activeModuleButton}
          >
            <Text style={styles.activeModuleText}>
              {ALL_MODULES.find(m => m.id === currentModule)?.label}
            </Text>
            {!isActive && <View style={styles.dropdownArrow} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsMuted(!isMuted)} style={styles.soundToggle}>
            <Text style={{color: isMuted ? '#666' : '#FFF', fontSize: 10, letterSpacing: 1}}>
              {isMuted ? 'MUTED' : 'SOUND'}
            </Text>
          </TouchableOpacity>
        </View>

        {!isActive && (
          <TouchableOpacity style={styles.settingsIcon} onPress={() => setShowSettings(true)}>
            <View style={styles.gearCircle}>
              <View style={styles.gearInner}/>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.mainDisplay}>
        {currentModule === 'breath' && (
           <View style={{alignItems:'center'}}>
              <Animated.View style={[styles.circle, {transform:[{scale:mainAnim}]}]} />
              <Text style={styles.phaseText}>
                {getPhaseDisplay()}
              </Text>
              <Text style={styles.counterText}>
                {getProgressDisplay()}
              </Text>
              {!isActive && (
                <Text style={styles.patternLabel}>{currentPattern.name}</Text>
              )}
           </View>
        )}

        {currentModule === 'swim' && (
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.swimZone} 
            onPress={() => { 
              if(isActive) { 
                setLaps(laps+1); 
                playSound(MODULE_SOUNDS.swim.stroke);
              }
            }}
          >
             <Text style={styles.largeNum}>{laps}</Text>
             <Text style={styles.label}>LAPS</Text>
             <Text style={styles.subLabel}>{formatTime(swimTime)}</Text>
          </TouchableOpacity>
        )}

        {currentModule === 'meditate' && (
          <View style={{alignItems:'center'}}>
             <Animated.View 
               style={[
                 styles.circle, 
                 {opacity: 0.3, transform:[{scale:mainAnim}], borderWidth: 1}
               ]} 
             />
             <Text style={styles.largeNum}>{formatTime(medTime)}</Text>
          </View>
        )}

        {(currentModule === 'run' || currentModule === 'cycle') && (
          <View style={{alignItems:'center'}}>
             <Text style={styles.comingSoonText}>Coming Soon</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, isActive && {backgroundColor: '#111'}]} 
          onPress={() => {
            if (isActive) { 
              resetAll(); 
            } else { 
              setIsActive(true); 
            }
          }}
        >
          <Text style={[styles.buttonText, isActive && {color: '#FFF'}]}>
            {isActive ? 'STOP' : 'START'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  toast: {
    position: 'absolute',
    top: 100,
    left: '10%',
    right: '10%',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    padding: 20,
    borderRadius: 15,
    zIndex: 1000,
    alignItems: 'center',
  },
  toastText: {
    color: '#FFF',
    fontSize: 14,
    letterSpacing: 1,
  },
  categoryBar: { 
    marginTop: 50, 
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#111'
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#0A0A0A'
  },
  categoryTabActive: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333'
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 8
  },
  categoryText: {
    color: '#444',
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '600'
  },
  categoryTextActive: {
    color: '#FFF'
  },
  emptyText: {
    color: '#444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic'
  },
  comingSoonText: {
    color: '#444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic'
  },
  topHeader: { 
    marginTop: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 30 
  },
  activeModuleButton: { flexDirection: 'row', alignItems: 'center' },
  activeModuleText: { color: '#FFF', fontSize: 18, fontWeight: '200', letterSpacing: 4 },
  dropdownArrow: { width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 5, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#444', marginLeft: 10, marginTop: 4 },
  soundToggle: { marginLeft: 20, borderLeftWidth: 1, borderLeftColor: '#222', paddingLeft: 15 },
  settingsIcon: { padding: 5 },
  gearCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#FFF' },
  gearInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF', position: 'absolute', top: 6.5, left: 6.5 },
  mainDisplay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  circle: { width: 180, height: 180, borderRadius: 90, borderWidth: 1.5, borderColor: '#FFF' },
  largeNum: { color: '#FFF', fontSize: 90, fontWeight: '100' },
  phaseText: { color: '#FFF', fontSize: 22, fontWeight: '200', letterSpacing: 8, marginTop: 50, minHeight: 30, textAlign: 'center' },
  counterText: { color: '#444', fontSize: 10, letterSpacing: 2, marginTop: 15, fontWeight: '600' },
  patternLabel: { color: '#333', fontSize: 10, letterSpacing: 2, marginTop: 25, fontStyle: 'italic' },
  swimZone: { alignItems: 'center', justifyContent: 'center', width: '100%' },
  label: { color: '#444', fontSize: 14, letterSpacing: 4 },
  subLabel: { color: '#666', fontSize: 18, marginTop: 10 },
  buttonContainer: { position: 'absolute', bottom: 80, width: '100%', alignItems: 'center' },
  button: { backgroundColor: '#FFF', paddingHorizontal: 60, paddingVertical: 20, borderRadius: 40, minWidth: 220, alignItems: 'center' },
  buttonText: { color: '#000', fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  pickerContainer: { width: '80%', height: '70%', alignItems: 'center' },
  pickerTitle: { color: '#FFF', fontSize: 14, letterSpacing: 5, marginBottom: 40, fontWeight: '600' },
  pickerItem: { paddingVertical: 20, width: '100%', alignItems: 'center' },
  pickerText: { color: '#333', fontSize: 28, fontWeight: '200', letterSpacing: 4 },
  activePickerText: { color: '#FFF' },
  closePicker: { marginTop: 40, padding: 20 },
  closePickerText: { color: '#666', fontSize: 12, letterSpacing: 2 },
  deleteConfirmContainer: {
    width: '85%',
    backgroundColor: '#0A0A0A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222',
    padding: 30,
    alignItems: 'center',
  },
  deleteConfirmTitle: {
    color: '#FFF',
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 20,
  },
  deleteConfirmMessage: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  deleteConfirmButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  deleteConfirmBtnCancel: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    paddingVertical: 16,
    borderRadius: 25,
    marginRight: 10,
    alignItems: 'center',
  },
  deleteConfirmBtnCancelText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  deleteConfirmBtnDelete: {
    flex: 1,
    backgroundColor: '#1A0000',
    paddingVertical: 16,
    borderRadius: 25,
    marginLeft: 10,
    alignItems: 'center',
  },
  deleteConfirmBtnDeleteText: {
    color: '#FF4444',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  builderContainer: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#0A0A0A',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  builderScroll: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  builderTitle: {
    color: '#FFF',
    fontSize: 14,
    letterSpacing: 4,
    fontWeight: '700',
    marginBottom: 30,
  },
  builderSection: {
    color: '#666',
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '700',
    marginTop: 25,
    marginBottom: 15,
  },
  builderItem: {
    width: '100%',
    marginBottom: 18,
  },
  builderLabel: {
    color: '#888',
    fontSize: 11,
    marginBottom: 8,
    letterSpacing: 1,
  },
  builderInput: {
    backgroundColor: '#111',
    color: '#FFF',
    fontSize: 18,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  builderButtons: {
    flexDirection: 'row',
    marginTop: 30,
    width: '100%',
    justifyContent: 'space-between',
  },
  builderBtnSecondary: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    paddingVertical: 16,
    borderRadius: 25,
    marginRight: 10,
    alignItems: 'center',
  },
  builderBtnSecondaryText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  builderBtnPrimary: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 25,
    marginLeft: 10,
    alignItems: 'center',
  },
  builderBtnPrimaryText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  settingsScroll: { flexGrow: 1, alignItems: 'center', paddingVertical: 80, paddingBottom: 120 },
  settingsTitle: { color: '#444', fontSize: 10, letterSpacing: 3, marginBottom: 25, fontWeight: '700' },
  settingItem: { width: '85%', marginBottom: 20 },
  settingLabel: { color: '#666', fontSize: 12, marginBottom: 10, textAlign: 'center' },
  input: { backgroundColor: '#111', color: '#FFF', fontSize: 22, textAlign: 'center', padding: 15, borderRadius: 15 },
  statsGrid: { flexDirection: 'row', width: '90%', justifyContent: 'space-between', marginBottom: 30 },
  statBox: { width: '30%', backgroundColor: '#111', padding: 15, borderRadius: 12, alignItems: 'center' },
  statNum: { color: '#FFF', fontSize: 22, fontWeight: '300' },
  statLabel: { color: '#333', fontSize: 8, marginTop: 4 },
  patternCard: {
    width: '90%',
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  patternName: {
    color: '#666',
    fontSize: 18,
    fontWeight: '300',
    letterSpacing: 2,
  },
  patternNameActive: {
    color: '#FFF',
    fontWeight: '500',
  },
  patternDetails: {
    color: '#444',
    fontSize: 11,
    marginTop: 8,
    letterSpacing: 1,
  },
  activeIndicator: {
    color: '#FFF',
    fontSize: 20,
    marginLeft: 10,
  },
  miniButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  miniButtonText: {
    color: '#666',
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
});