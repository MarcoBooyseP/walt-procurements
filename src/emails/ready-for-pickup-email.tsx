import * as React from 'react';

interface ReadyForPickupEmailProps {
  requestedBy: string;
  farmLocation: string;
  category: string;
  itemDetails: string;
  quantity: string | number;
  fallbackNotice?: string;
}

export const ReadyForPickupEmail: React.FC<Readonly<ReadyForPickupEmailProps>> = ({
  requestedBy,
  farmLocation,
  category,
  itemDetails,
  quantity,
  fallbackNotice,
}) => {
  const homeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/home`;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '32px', backgroundColor: '#ffffff' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <img src="https://walt-procurements.s3.af-south-1.amazonaws.com/cropped-Walt-Landgoed-Favicon.png" alt="Walt Landgoed Logo" style={{ height: '60px', width: 'auto' }} />
      </div>
      <h1 style={{ color: '#10b981', marginTop: 0, fontSize: '24px', borderBottom: '2px solid #f3f4f6', paddingBottom: '16px' }}>Your Order is Ready for Pickup!</h1>
      {fallbackNotice && (
        <div style={{ backgroundColor: '#fffbeb', color: '#b45309', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fde68a' }}>
          <strong>Note:</strong> {fallbackNotice}
        </div>
      )}
      <p style={{ color: '#505050', fontSize: '16px', lineHeight: '1.5' }}>
        Hi <strong>{requestedBy}</strong>,
      </p>
      <p style={{ color: '#505050', fontSize: '16px', lineHeight: '1.5' }}>
        Great news! The items you requested for <strong>{farmLocation}</strong> have arrived and are now ready to be picked up.
      </p>
      
      <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '32px', marginTop: '24px', border: '1px solid #e5e7eb' }}>
        <p style={{ margin: '0 0 12px 0', fontSize: '15px' }}><strong style={{ color: '#374151' }}>Category:</strong> {category}</p>
        <p style={{ margin: '0 0 12px 0', fontSize: '15px', lineHeight: '1.5' }}><strong style={{ color: '#374151' }}>Details:</strong><br/>{itemDetails}</p>
        <p style={{ margin: '0 0 0 0', fontSize: '15px' }}><strong style={{ color: '#374151' }}>Quantity:</strong> {quantity}</p>
      </div>

      <div style={{ textAlign: 'center' }}>
        <a 
          href={homeUrl} 
          style={{ display: 'inline-block', backgroundColor: '#10b981', color: '#ffffff', padding: '14px 28px', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }}
        >
          View in My Inbox
        </a>
      </div>
      <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.5', marginTop: '32px', textAlign: 'center' }}>
        Please collect your items as soon as possible. Remember to mark the order as "Received" in your inbox once you have picked them up.
      </p>
    </div>
  );
};
