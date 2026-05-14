import * as React from 'react';

interface AccountsNotificationProps {
  id: string;
  requestedBy: string;
  farmLocation: string;
  category: string;
  itemDetails: string;
  urgency: string;
  managerComment?: string | null;
  appUrl: string;
}

export const AccountsNotificationEmail: React.FC<Readonly<AccountsNotificationProps>> = ({
  id,
  requestedBy,
  farmLocation,
  category,
  itemDetails,
  urgency,
  managerComment,
  appUrl,
}) => (
  <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '32px', backgroundColor: '#ffffff' }}>
    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
      <img src="https://walt-procurements.s3.af-south-1.amazonaws.com/cropped-Walt-Landgoed-Favicon.png" alt="Walt Landgoed Logo" style={{ height: '60px', width: 'auto' }} />
    </div>
    
    <h1 style={{ color: '#aa272f', marginTop: 0, fontSize: '24px', borderBottom: '2px solid #f3f4f6', paddingBottom: '16px' }}>Approved Procurement Request</h1>
    
    <p style={{ color: '#505050', fontSize: '16px', lineHeight: '1.5' }}>
      The following supply request has been <strong>Approved</strong> by management and is ready for procurement.
    </p>

    <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '32px', marginTop: '24px', border: '1px solid #e5e7eb' }}>
      <p style={{ margin: '0 0 12px 0', fontSize: '15px' }}><strong style={{ color: '#374151' }}>Requested By:</strong> {requestedBy}</p>
      <p style={{ margin: '0 0 12px 0', fontSize: '15px' }}><strong style={{ color: '#374151' }}>Location:</strong> {farmLocation}</p>
      <p style={{ margin: '0 0 12px 0', fontSize: '15px' }}><strong style={{ color: '#374151' }}>Category:</strong> {category}</p>
      <p style={{ margin: '0 0 12px 0', fontSize: '15px' }}><strong style={{ color: '#374151' }}>Urgency:</strong> {urgency}</p>
      <p style={{ margin: '0 0 12px 0', fontSize: '15px', lineHeight: '1.5' }}><strong style={{ color: '#374151' }}>Details:</strong><br/>{itemDetails}</p>
      
      {managerComment && (
        <div style={{ marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
          <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.5' }}><strong style={{ color: '#374151' }}>Manager's Instructions:</strong><br/>{managerComment}</p>
        </div>
      )}
    </div>

    <div style={{ textAlign: 'center' }}>
      <a 
        href={`${appUrl}/accounts/summary/${id}`} 
        style={{ display: 'inline-block', backgroundColor: '#aa272f', color: '#ffffff', padding: '14px 28px', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }}
      >
        View Procurement Summary
      </a>
    </div>
    
    <p style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '24px', color: '#9ca3af', fontSize: '12px' }}>
      Walt Landgoed Procurement System
    </p>
  </div>
);
