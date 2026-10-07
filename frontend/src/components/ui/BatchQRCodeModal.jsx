import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, ExternalLink, QrCode, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BatchQRCodeModal = ({ isOpen, onClose, batchNo, productName, managerName }) => {
  if (!isOpen || !batchNo) return null;

  const navigate = useNavigate();
  const qrRef = useRef(null);

  // Construct absolute traceability URL for the scanned QR code
  const traceUrl = `${window.location.origin}/traceability?batch=${encodeURIComponent(batchNo)}`;

  const handleDownload = () => {
    const svgElement = qrRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 80;
      canvas.height = img.height + 140;

      // Fill white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Header Text
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Batch Traceability QR Code`, canvas.width / 2, 35);

      ctx.fillStyle = '#2563EB';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`Batch: ${batchNo}`, canvas.width / 2, 60);

      // Draw QR Image
      ctx.drawImage(img, 40, 80);

      // Draw Footer Text
      ctx.fillStyle = '#64748B';
      ctx.font = '12px sans-serif';
      ctx.fillText(productName ? `Product: ${productName}` : 'Product Traceability System', canvas.width / 2, canvas.height - 25);

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngFile;
      downloadLink.download = `QR-Batch-${batchNo}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleGoToTrace = () => {
    onClose();
    navigate(`/manager/traceability?batch=${encodeURIComponent(batchNo)}`);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="card-surface animate-scale-in" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2rem',
        borderRadius: '20px',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: '0.4rem',
            borderRadius: '50%'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Icon & Title */}
        <div style={{
          display: 'inline-flex',
          padding: '0.75rem',
          borderRadius: '14px',
          backgroundColor: '#EFF6FF',
          color: 'var(--primary-blue)',
          marginBottom: '1rem'
        }}>
          <QrCode size={30} />
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          Batch QR Code
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '1.25rem' }}>
          Scan to view end-to-end supply chain traceability & recall status
        </p>

        {/* QR Display Container */}
        <div
          ref={qrRef}
          style={{
            background: '#FFFFFF',
            padding: '1.5rem',
            borderRadius: '16px',
            border: '2px dashed #DBEAFE',
            display: 'inline-block',
            marginBottom: '1.25rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}
        >
          <QRCodeSVG
            value={traceUrl}
            size={200}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: 'https://api.iconify.design/lucide:shield-check.svg',
              x: undefined,
              y: undefined,
              height: 24,
              width: 24,
              excavate: true
            }}
          />
        </div>

        {/* Batch Info Metadata */}
        <div style={{
          backgroundColor: 'var(--bg-canvas-subtle)',
          padding: '0.75rem 1rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Batch Number:</span>
            <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-blue)' }}>{batchNo}</strong>
          </div>
          {productName && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Product:</span>
              <strong style={{ color: 'var(--text-main)' }}>{productName}</strong>
            </div>
          )}
          {managerName && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Manufacturer:</span>
              <span>{managerName}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleDownload}
            className="btn btn-outline"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            <Download size={16} />
            <span>Download</span>
          </button>
          <button
            onClick={handleGoToTrace}
            className="btn btn-primary"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            <ExternalLink size={16} />
            <span>View Lineage</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchQRCodeModal;
