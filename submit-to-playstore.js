#!/usr/bin/env node

/**
 * Submit Android app to Google Play Store
 * Requires: GCLOUD_SERVICE_ACCOUNT_CREDENTIALS env variable with JSON credentials
 * Usage: node submit-to-playstore.js <path-to-aab-file>
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const PACKAGE_NAME = 'com.ashok.mezr';
const TRACK = 'internal';

async function submitToPlayStore(aabPath) {
  try {
    // Validate input
    if (!aabPath) {
      throw new Error('AAB path is required');
    }

    if (!fs.existsSync(aabPath)) {
      throw new Error(`AAB file not found: ${aabPath}`);
    }

    // Get service account credentials
    const credentialsJson = process.env.GCLOUD_SERVICE_ACCOUNT_CREDENTIALS;

    if (!credentialsJson) {
      throw new Error(
        'GCLOUD_SERVICE_ACCOUNT_CREDENTIALS environment variable not set'
      );
    }

    let credentials;
    try {
      credentials = JSON.parse(credentialsJson);
    } catch (parseError) {
      console.error(
        'Failed to parse GCLOUD_SERVICE_ACCOUNT_CREDENTIALS as JSON'
      );
      console.error('Value:', credentialsJson.substring(0, 100) + '...');
      throw parseError;
    }

    if (!credentials.type || credentials.type !== 'service_account') {
      throw new Error('Invalid service account credentials format');
    }

    console.log('🔐 Authenticating with Google Play...');

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/androidpublisher']
    });

    const androidpublisher = google.androidpublisher({
      version: 'v3',
      auth
    });

    console.log('📦 Reading AAB file...');
    const aabBuffer = fs.readFileSync(aabPath);
    console.log(`   File size: ${(aabBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    // Step 1: Create an edit
    console.log('📝 Creating edit session...');
    const editResponse = await androidpublisher.edits.insert({
      packageName: PACKAGE_NAME
    });

    const editId = editResponse.data.id;
    console.log(`   Edit ID: ${editId}`);

    // Step 2: Upload the bundle
    console.log('⬆️  Uploading AAB to Google Play...');
    const uploadResponse = await androidpublisher.edits.bundles.upload({
      packageName: PACKAGE_NAME,
      editId: editId,
      media: {
        mimeType: 'application/octet-stream',
        body: aabBuffer
      }
    });

    const bundleVersionCode = uploadResponse.data.versionCode;
    console.log(`   ✅ Bundle uploaded. Version code: ${bundleVersionCode}`);

    // Step 3: Create a release on internal track
    console.log(`🚀 Creating release on ${TRACK} track...`);
    const releaseResponse = await androidpublisher.edits.tracks.update({
      packageName: PACKAGE_NAME,
      editId: editId,
      track: TRACK,
      requestBody: {
        track: TRACK,
        releases: [
          {
            name: `Version 1.0.2 - Build ${bundleVersionCode}`,
            versionCodes: [bundleVersionCode.toString()],
            status: 'draft',
            releaseNotes: [
              {
                language: 'en-US',
                text: 'Version 1.0.2 - Audio background mode fix (Guideline 2.5.4)'
              }
            ]
          }
        ]
      }
    });

    console.log(`   ✅ Release created on ${TRACK} track`);

    // Step 4: Commit the edit
    console.log('💾 Committing changes...');
    await androidpublisher.edits.commit({
      packageName: PACKAGE_NAME,
      editId: editId
    });

    console.log(
      '\n✨ SUCCESS! App submitted to Google Play internal testing track'
    );
    console.log(`   Package: ${PACKAGE_NAME}`);
    console.log(`   Track: ${TRACK}`);
    console.log(`   Version Code: ${bundleVersionCode}`);
    console.log(
      '\n📱 The app will appear in Google Play Console shortly.'
    );

    return true;
  } catch (error) {
    console.error('\n❌ Submission failed:');
    console.error(error.message);

    if (error.details) {
      console.error('\nDetails:', error.details);
    }

    process.exit(1);
  }
}

// Main
const aabPath = process.argv[2];
submitToPlayStore(aabPath);
