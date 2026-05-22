import * as React from 'react';

interface ReadyForPickupNotificationProps {
  requestedBy: string;
  category: string;
  itemDetails: string;
}

export const ReadyForPickupNotificationEmail: React.FC<Readonly<ReadyForPickupNotificationProps>> = ({
  requestedBy,
  category,
  itemDetails,
}) => (
  <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '32px', backgroundColor: '#ffffff' }}>
    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
      <img src="https://walt-procurements.s3.af-south-1.amazonaws.com/cropped-Walt-Landgoed-Favicon.png" alt="Walt Landgoed Logo" style={{ height: '60px', width: 'auto' }} />
    </div>
    <h1 style={{ color: '#16a34a', marginTop: 0, fontSize: '24px', borderBottom: '2px solid #f3f4f6', paddingBottom: '16px' }}>Ready for Pickup</h1>
    <p style={{ color: '#505050', fontSize: '16px', lineHeight: '1.5' }}>
      Hi {requestedBy},
    </p>
    <p style={{ color: '#505050', fontSize: '16px', lineHeight: '1.5' }}>
      Great news! The items you requested are now ready to be picked up.
    </p>
    
    <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '32px', marginTop: '24px', border: '1px solid #e5e7eb' }}>
      <p style={{ margin: '0 0 12px 0', fontSize: '15px' }}><strong style={{ color: '#374151' }}>Category:</strong> {category}</p>
      <p style={{ margin: '0 0 12px 0', fontSize: '15px', lineHeight: '1.5' }}><strong style={{ color: '#374151' }}>Details:</strong><br/>{itemDetails}</p>
    </div>

    <p style={{ color: '#505050', fontSize: '16px', lineHeight: '1.5', marginBottom: '24px' }}>
      Please sign in to the platform and mark the request as "Picked Up" once you have received the items.
    </p>

    <div style={{ textAlign: 'center' }}>
      <a 
        href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/requests`} 
        style={{ display: 'inline-block', backgroundColor: '#aa272f', color: '#ffffff', padding: '14px 28px', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }}
      >
        Track My Requests
      </a>
    </div>
  </div>
);
