import * as React from 'react';

interface ApprovalNotificationProps {
  requestedBy: string;
  category: string;
  itemDetails: string;
  managerComment?: string | null;
}

export const ApprovalNotificationEmail: React.FC<Readonly<ApprovalNotificationProps>> = ({
  requestedBy,
  category,
  itemDetails,
  managerComment,
}) => (
  <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '32px', backgroundColor: '#ffffff' }}>
    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
      <img src="https://walt-procurements.s3.af-south-1.amazonaws.com/cropped-Walt-Landgoed-Favicon.png" alt="Walt Landgoed Logo" style={{ height: '60px', width: 'auto' }} />
    </div>
    
    <h1 style={{ color: '#16a34a', marginTop: 0, fontSize: '24px', borderBottom: '2px solid #f3f4f6', paddingBottom: '16px' }}>Request Approved!</h1>
    
    <p style={{ color: '#505050', fontSize: '16px', lineHeight: '1.5' }}>
      Hello <strong>{requestedBy}</strong>,
    </p>
    
    <p style={{ color: '#505050', fontSize: '16px', lineHeight: '1.5' }}>
      Great news! Your supply request for <strong>{category}</strong> has been <strong>Approved</strong> by management and sent to the accounts department for procurement.
    </p>

    <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '8px', marginBottom: '32px', marginTop: '24px', border: '1px solid #bbf7d0' }}>
      <p style={{ margin: '0 0 12px 0', fontSize: '15px' }}><strong style={{ color: '#166534' }}>Original Request:</strong><br/>{itemDetails}</p>
      
      {managerComment && (
        <div style={{ marginTop: '16px', borderTop: '1px solid #bbf7d0', paddingTop: '16px' }}>
          <p style={{ margin: 0, fontSize: '15px' }}><strong style={{ color: '#166534' }}>Manager's Comment:</strong><br/>{managerComment}</p>
        </div>
      )}
    </div>

    <p style={{ color: '#505050', fontSize: '14px', lineHeight: '1.5', textAlign: 'center' }}>
      We will notify you once the items have been ordered.
    </p>
    
    <p style={{ mt: '32px', textAlign: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '24px', color: '#9ca3af', fontSize: '12px' }}>
      Walt Landgoed Procurement System
    </p>
  </div>
);
