# MEZR Changelog

## [1.0.1] - 2026-03-08

### Added
- Export sessions to JSON backup file
- Import sessions from backup with merge/overwrite options
- Automatic backup detection on app startup
- System share integration (email, cloud storage, etc.)
- PAUSE, SKIP, RESET buttons during breathing session
- Screen keep-awake during active breathing sessions

### Fixed
- App icon now displays correctly on home screen
- App name changed from "mezr-v2" to "MEZR"
- Settings screen now scrolls properly with keyboard open
- SKIP button now intelligently advances through session stages (inhale → exhale → hold → complete)
- App bundle identifiers unified (com.mezr.app for both iOS and Android)
- Splash screen now matches dark theme with black background

### Changed
- Improved touch handling in modals (TouchableOpacity → Pressable for React Native 0.81 New Architecture)

---

## v1.0.1 (Upcoming)
- Added: Export breathing session data to JSON backup file
- Added: Import data from backup with merge/replace options
- Added: Backup file management (list, delete old backups)
- Export/import backup feature (local JSON file backup and restore)

### Removed
- Cloud backup toggle and popup from Settings (no cloud infrastructure planned for near-term)

## V1.1.0 (feature additions) (upcoming)
-Infinity scroll
-Notification bar access
-in app custom reminders


## v1.0.0 (2026-XX-XX)
- Initial release
- Breathing exercises with customizable patterns
- Swimming lap counter
- Meditation timer
- Synergy score and habit stacking visualization
- Privacy dashboard with data export
- Cloud backup (opt-in)
- Account management with full data deletion