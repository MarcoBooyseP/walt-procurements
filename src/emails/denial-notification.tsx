import * as React from 'react';

interface DenialNotificationProps {
  requestedBy: string;
  category: string;
  itemDetails: string;
  managerComment?: string | null;
}

export const DenialNotificationEmail: React.FC<Readonly<DenialNotificationProps>> = ({
  requestedBy,
  category,
  itemDetails,
  managerComment,
}) => (
  <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '32px', backgroundColor: '#ffffff' }}>
    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
      <img src="https://walt-procurements.s3.af-south-1.amazonaws.com/cropped-Walt-Landgoed-Favicon.png" alt="Walt Landgoed Logo" style={{ height: '60px', width: 'auto' }} />
    </div>
    
    <h1 style={{ color: '#aa272f', marginTop: 0, fontSize: '24px', borderBottom: '2px solid #f3f4f6', paddingBottom: '16px' }}>Request Update</h1>
    
    <p style={{ color: '#505050', fontSize: '16px', lineHeight: '1.5' }}>
      Hello <strong>{requestedBy}</strong>,
    </p>
    
    <p style={{ color: '#505050', fontSize: '16px', lineHeight: '1.5' }}>
      Your supply request for <strong>{category}</strong> has been <strong>Denied</strong> by management.
    </p>

    <div style={{ backgroundColor: '#fff1f2', padding: '20px', borderRadius: '8px', marginBottom: '32px', marginTop: '24px', border: '1px solid #fecaca' }}>
      <p style={{ margin: '0 0 12px 0', fontSize: '15px' }}><strong style={{ color: '#991b1b' }}>Original Request:</strong><br/>{itemDetails}</p>
      
      {managerComment && (
        <div style={{ marginTop: '16px', borderTop: '1px solid #fecaca', paddingTop: '16px' }}>
          <p style={{ margin: 0, fontSize: '15px' }}><strong style={{ color: '#991b1b' }}>Manager's Comment:</strong><br/>{managerComment}</p>
        </div>
      )}
    </div>

    <p style={{ color: '#505050', fontSize: '14px', lineHeight: '1.5', textAlign: 'center' }}>
      If you have any questions, please contact your manager directly.
    </p>
    
    <p style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '24px', color: '#9ca3af', fontSize: '12px' }}>
      Walt Landgoed Procurement System
    </p>
  </div>
);
