import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Image,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AppStartSplash({ onFinish }) {
  const [stage, setStage] = useState(1);
  const [currentTime, setCurrentTime] = useState('');

  // Animation values
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoTranslateY = useRef(new Animated.Value(20)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Orbit rotation loop animations
  const orbitInnerRot = useRef(new Animated.Value(0)).current;
  const orbitMiddleRot = useRef(new Animated.Value(0)).current;
  const orbitOuterRot = useRef(new Animated.Value(0)).current;

  // Brand and Tagline animations
  const brandAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;

  // Stage 5 animations
  const stage5Fade = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0.6)).current;

  // Exit animation
  const exitScale = useRef(new Animated.Value(1)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Current clock time
    const now = new Date();
    setCurrentTime(
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );

    // Stage 1: Logo Pop In
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true
      }),
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.08,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true
        }),
        Animated.timing(logoScale, {
          toValue: 1.0,
          duration: 250,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ]),
      Animated.sequence([
        Animated.timing(logoTranslateY, {
          toValue: -4,
          duration: 600,
          useNativeDriver: true
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true
        })
      ])
    ]).start();

    // Orbit loops
    const startOrbitLoops = () => {
      Animated.loop(
        Animated.timing(orbitInnerRot, {
          toValue: 1,
          duration: 9000,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ).start();

      Animated.loop(
        Animated.timing(orbitMiddleRot, {
          toValue: 1,
          duration: 14000,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ).start();

      Animated.loop(
        Animated.timing(orbitOuterRot, {
          toValue: 1,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ).start();
    };

    startOrbitLoops();

    // Stage Timers matching base.apk timings
    const t2 = setTimeout(() => {
      setStage(2);
    }, 800);

    const t3 = setTimeout(() => {
      setStage(3);
      Animated.timing(brandAnim, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }).start();
    }, 1700);

    const t4 = setTimeout(() => {
      setStage(4);
      Animated.timing(taglineAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }).start();
    }, 2600);

    const t5 = setTimeout(() => {
      setStage(5);
      Animated.parallel([
        Animated.timing(stage5Fade, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        }),
        Animated.timing(badgeScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.7)),
          useNativeDriver: true
        })
      ]).start();
    }, 3600);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  const handleFinish = () => {
    Animated.parallel([
      Animated.timing(exitScale, {
        toValue: 1.04,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      }),
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      })
    ]).start(() => {
      if (onFinish) onFinish();
    });
  };

  // Interpolations
  const spinInner = orbitInnerRot.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const spinMiddle = orbitMiddleRot.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg']
  });

  const spinOuter = orbitOuterRot.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const brandTranslateY = brandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0]
  });

  const taglineTranslateY = taglineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 0]
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: exitOpacity,
          transform: [{ scale: exitScale }]
        }
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Top Device Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusTime}>{currentTime || '12:00'}</Text>
        <View style={styles.statusIcons}>
          <Ionicons name="cellular" size={14} color="#64748b" />
          <Ionicons name="wifi" size={14} color="#64748b" />
          <Ionicons name="battery-full" size={16} color="#64748b" />
        </View>
      </View>

      {/* Skip Button during Stage 1-4 */}
      {stage < 5 && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleFinish}>
          <Text style={styles.skipBtnText}>Skip</Text>
          <Ionicons name="chevron-forward" size={13} color="#0f766e" />
        </TouchableOpacity>
      )}

      {/* Stages 1 to 4 Content */}
      {stage < 5 && (
        <View style={styles.stageContent}>
          <View style={styles.logoStageBox}>
            {/* Concentric Orbit System from Stage 2 */}
            {stage >= 2 && (
              <View style={styles.orbitSystem}>
                {/* Outer Ring */}
                <Animated.View
                  style={[
                    styles.orbitRing,
                    styles.orbitOuter,
                    { transform: [{ rotate: spinOuter }] }
                  ]}
                >
                  <View style={[styles.orbitDot, styles.dot3]} />
                </Animated.View>

                {/* Middle Ring */}
                <Animated.View
                  style={[
                    styles.orbitRing,
                    styles.orbitMiddle,
                    { transform: [{ rotate: spinMiddle }] }
                  ]}
                >
                  <View style={[styles.orbitDot, styles.dot2]} />
                </Animated.View>

                {/* Inner Ring */}
                <Animated.View
                  style={[
                    styles.orbitRing,
                    styles.orbitInner,
                    { transform: [{ rotate: spinInner }] }
                  ]}
                >
                  <View style={[styles.orbitDot, styles.dot1]} />
                </Animated.View>
              </View>
            )}

            {/* Aparaitech 3D Isometric Cube Logo */}
            <Animated.View
              style={[
                styles.logoWrap,
                {
                  opacity: logoOpacity,
                  transform: [
                    { scale: logoScale },
                    { translateY: logoTranslateY }
                  ]
                }
              ]}
            >
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          {/* Brand Heading Group */}
          <Animated.View
            style={[
              styles.brandGroup,
              {
                opacity: brandAnim,
                transform: [{ translateY: brandTranslateY }]
              }
            ]}
          >
            <Text style={styles.brandTitle}>APARAITECH</Text>
            <Text style={styles.brandSub}>SOFTWARE COMPANY</Text>
          </Animated.View>

          {/* Futuristic Tagline Pill */}
          <Animated.View
            style={[
              styles.taglineBox,
              {
                opacity: taglineAnim,
                transform: [{ translateY: taglineTranslateY }]
              }
            ]}
          >
            <View style={styles.taglinePill}>
              <Text style={styles.taglineText}>
                INNOVATING SOFTWARE DEVELOPMENT FOR THE FUTURE
              </Text>
            </View>
          </Animated.View>
        </View>
      )}

      {/* Stage 5: Grand Landing Stage */}
      {stage === 5 && (
        <Animated.View style={[styles.stage5Container, { opacity: stage5Fade }]}>
          {/* Angled Ribbon Overlays matching base.apk */}
          <View style={styles.geometricOverlay}>
            <View style={[styles.ribbon, styles.ribbonNavy]} />
            <View style={[styles.ribbon, styles.ribbonTeal]} />
            <View style={[styles.ribbon, styles.ribbonGold]} />
            <View style={[styles.ribbon, styles.ribbonCyan]} />
          </View>

          {/* Elevated Floating Badge Circle */}
          <View style={styles.stage5Center}>
            <Animated.View
              style={[
                styles.stage5BadgeCircle,
                { transform: [{ scale: badgeScale }] }
              ]}
            >
              <Image
                source={require('../../assets/logo.png')}
                style={styles.stage5Logo}
                resizeMode="contain"
              />
              <View style={styles.stage5BadgeText}>
                <Text style={styles.stage5Brand}>APARAITECH</Text>
                <Text style={styles.stage5Sub}>ATTENDANCE</Text>
              </View>
            </Animated.View>
          </View>

          {/* Bottom Call To Action Area */}
          <View style={styles.stage5BottomArea}>
            <View style={styles.stage5TaglineRow}>
              <Text style={styles.goldSparkle}>✦</Text>
              <Text style={styles.stage5TaglineText}>
                Enterprise Biometric & HRMS Portal
              </Text>
            </View>

            <TouchableOpacity
              style={styles.getStartedBtn}
              onPress={handleFinish}
              activeOpacity={0.88}
            >
              <Text style={styles.getStartedBtnText}>Get Started</Text>
              <View style={styles.arrowCircle}>
                <Ionicons name="arrow-forward" size={16} color="#ffffff" />
              </View>
            </TouchableOpacity>

            <View style={styles.stage5FooterInfo}>
              <Text style={styles.footerSite}>aparaitech.org</Text>
              <Text style={styles.footerDot}>•</Text>
              <Text style={styles.footerVersion}>v2.5.0</Text>
            </View>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 99999,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 45,
    paddingHorizontal: 24,
    zIndex: 10
  },
  statusTime: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b'
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  skipBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 20
  },
  skipBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f766e'
  },
  stageContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20
  },
  logoStageBox: {
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  orbitSystem: {
    position: 'absolute',
    width: 260,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center'
  },
  orbitRing: {
    position: 'absolute',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center'
  },
  orbitInner: {
    width: 150,
    height: 150,
    borderWidth: 1.5,
    borderColor: 'rgba(13, 148, 136, 0.35)',
    borderStyle: 'dashed'
  },
  orbitMiddle: {
    width: 200,
    height: 200,
    borderWidth: 1.5,
    borderColor: 'rgba(6, 182, 212, 0.45)',
    borderStyle: 'dotted'
  },
  orbitOuter: {
    width: 250,
    height: 250,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.2)'
  },
  orbitDot: {
    position: 'absolute',
    borderRadius: 10
  },
  dot1: {
    width: 8,
    height: 8,
    backgroundColor: '#0d9488',
    top: -4,
    left: '50%',
    marginLeft: -4
  },
  dot2: {
    width: 6,
    height: 6,
    backgroundColor: '#06b6d4',
    bottom: 20,
    right: 15
  },
  dot3: {
    width: 7,
    height: 7,
    backgroundColor: '#f59e0b',
    top: 40,
    left: 10
  },
  logoWrap: {
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5
  },
  logoImage: {
    width: 120,
    height: 120
  },
  brandGroup: {
    alignItems: 'center',
    marginTop: 18
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#0f172a',
    textTransform: 'uppercase'
  },
  brandSub: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    color: '#64748b',
    textTransform: 'uppercase',
    marginTop: 6
  },
  taglineBox: {
    marginTop: 26,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center'
  },
  taglinePill: {
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  taglineText: {
    color: '#0f766e',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
    lineHeight: 16
  },

  // Stage 5 Styles
  stage5Container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f8fafc',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden'
  },
  geometricOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  ribbon: {
    position: 'absolute',
    transform: [{ rotate: '-35deg' }]
  },
  ribbonNavy: {
    width: 450,
    height: 160,
    backgroundColor: '#0b192c',
    top: -80,
    left: -120
  },
  ribbonTeal: {
    width: 380,
    height: 90,
    backgroundColor: '#008080',
    top: 15,
    left: -60
  },
  ribbonGold: {
    width: 320,
    height: 55,
    backgroundColor: '#f59e0b',
    top: 80,
    right: -90
  },
  ribbonCyan: {
    width: 240,
    height: 40,
    backgroundColor: '#06b6d4',
    bottom: -40,
    left: -40
  },
  stage5Center: {
    marginTop: SCREEN_HEIGHT * 0.18,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stage5BadgeCircle: {
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: '#ffffff',
    borderWidth: 4,
    borderColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 8
  },
  stage5Logo: {
    width: 85,
    height: 85
  },
  stage5BadgeText: {
    alignItems: 'center',
    marginTop: 8
  },
  stage5Brand: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 3.5,
    color: '#0b192c'
  },
  stage5Sub: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
    color: '#008080',
    marginTop: 2
  },
  stage5BottomArea: {
    zIndex: 10,
    width: '100%',
    paddingHorizontal: 28,
    paddingBottom: 40,
    alignItems: 'center'
  },
  stage5TaglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18
  },
  goldSparkle: {
    color: '#f59e0b',
    fontSize: 15
  },
  stage5TaglineText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569'
  },
  getStartedBtn: {
    width: '100%',
    maxWidth: 320,
    height: 54,
    backgroundColor: '#008080',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#008080',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5
  },
  getStartedBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  stage5FooterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18
  },
  footerSite: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8'
  },
  footerDot: {
    color: '#94a3b8'
  },
  footerVersion: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8'
  }
});
