import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

const BarcodeScanner = ({ onScan, onClose }: BarcodeScannerProps) => {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true
      },
      false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        scanner.clear();
        onClose();
      },
      (err) => {
        // Not all errors need to be displayed (many are just "no QR found in this frame")
        if (typeof err === 'string' && !err.includes("NotFound")) {
          setError('Camera error. Please ensure permissions are granted.');
        }
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScan, onClose]);

  return (
    <Box sx={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      p: 2
    }}>
      <Box sx={{
        width: '100%',
        maxWidth: 500,
        backgroundColor: 'background.paper',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight="700">Scan Barcode / QR</Typography>
          <IconButton onClick={onClose} size="small">
            <X />
          </IconButton>
        </Box>
        <Box sx={{ p: 2 }}>
          <div id="reader" ref={scannerRef} style={{ width: '100%', borderRadius: 8, overflow: 'hidden' }}></div>
          {error && <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>{error}</Typography>}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
            Point your camera at a barcode to scan it automatically.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default BarcodeScanner;
