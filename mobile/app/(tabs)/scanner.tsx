import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <FontAwesome name="camera" size={64} color="#10b981" />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          We need camera access to scan product barcodes and check their safety.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    // Navigate to the product detail screen
    router.push(`/product/${data}`);
    // Reset after a short delay so they can scan again when they come back
    setTimeout(() => setScanned(false), 2000);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'code93', 'itf14'],
        }}
      >
        <View style={styles.overlay}>
          <Text style={styles.topText}>NutriSafe Scanner</Text>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.instructionText}>
            Point at a product barcode
          </Text>
          <Text style={styles.subText}>
            EAN-13 · UPC · Code 128 · and more
          </Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  topText: {
    color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 32,
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  scanArea: {
    width: 280, height: 140, borderRadius: 12,
    backgroundColor: 'transparent', position: 'relative',
  },
  corner: {
    position: 'absolute', width: 30, height: 30,
    borderColor: '#10b981', borderWidth: 3,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 12 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 12 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 12 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 12 },
  instructionText: {
    color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 24,
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  subText: {
    color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 6,
  },
  permissionContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#f0fdf4', padding: 32,
  },
  permissionTitle: { fontSize: 22, fontWeight: '700', color: '#064e3b', marginTop: 20, marginBottom: 10 },
  permissionText: { fontSize: 15, color: '#065f46', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  permissionButton: { backgroundColor: '#10b981', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  permissionButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
