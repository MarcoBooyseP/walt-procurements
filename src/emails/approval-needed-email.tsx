import * as React from 'react';

interface ApprovalNeededEmailProps {
  id: string;
  requestedBy: string;
  farmLocation: string;
  category: string;
  itemDetails: string;
  urgency: string;
  quantity: string | number | null;
  fileUrls: string[];
  reviewerRole: 'MANAGER' | 'DIRECTOR';
  fallbackNotice?: string;
}

export const ApprovalNeededEmail: React.FC<Readonly<ApprovalNeededEmailProps>> = ({
  id,
  requestedBy,
  farmLocation,
  category,
  itemDetails,
  urgency,
  quantity,
  fileUrls,
  reviewerRole,
  fallbackNotice,
}) => {
  const reviewPath = reviewerRole === 'MANAGER' ? `/manager/review/${id}` : `/director/review/${id}`;
  const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${reviewPath}`;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '32px', backgroundColor: '#ffffff' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <img src="https://walt-procurements.s3.af-south-1.amazonaws.com/cropped-Walt-Landgoed-Favicon.png" alt="Walt Landgoed Logo" style={{ height: '60px', width: 'auto' }} />
      </div>
      <h1 style={{ color: '#aa272f', marginTop: 0, fontSize: '24px', borderBottom: '2px solid #f3f4f6', paddingBottom: '16px' }}>Action Required: Approval Needed</h1>
      {fallbackNotice && (
        <div style={{ backgroundColor: '#fffbeb', color: '#b45309', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fde68a' }}>
          <strong>Note:</strong> {fallbackNotice}
        </div>
      )}
      <p style={{ color: '#505050', fontSize: '16px', lineHeight: '1.5' }}>
        <strong>{requestedBy}</strong> has submitted a supply request for <strong>{farmLocation}</strong> that requires your review as a {reviewerRole === 'MANAGER' ? 'Manager' : 'Director'}.
      </p>
      
      <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '32px', marginTop: '24px', border: '1px solid #e5e7eb' }}>
        <p style={{ margin: '0 0 12px 0', fontSize: '15px' }}>
          <strong style={{ color: '#374151' }}>Urgency:</strong> 
          <span style={{ 
            marginLeft: '8px',
            fontWeight: 'bold',
            color: urgency === 'Critical' ? '#dc2626' : urgency === 'Medium' ? '#d97706' : '#2563eb' 
          }}>
            {urgency}
          </span>
        </p>
        <p style={{ margin: '0 0 12px 0', fontSize: '15px' }}><strong style={{ color: '#374151' }}>Category:</strong> {category}</p>
        <p style={{ margin: '0 0 12px 0', fontSize: '15px', lineHeight: '1.5' }}><strong style={{ color: '#374151' }}>Details & Reason:</strong><br/>{itemDetails}</p>
        <p style={{ margin: '0 0 12px 0', fontSize: '15px' }}><strong style={{ color: '#374151' }}>Quantity:</strong> {quantity || "—"}</p>

        {fileUrls && fileUrls.length > 0 && (
          <div style={{ marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
            <strong style={{ color: '#374151', fontSize: '15px' }}>Attachments ({fileUrls.length}):</strong>
            <div style={{ marginTop: '12px' }}>
              {fileUrls.map((url, index) => (
                <div key={index} style={{ marginBottom: '16px' }}>
                  {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img 
                      src={url} 
                      alt={`Attachment ${index + 1}`} 
                      style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #e5e7eb', display: 'block' }} 
                    />
                  ) : (
                    <a 
                      href={url} 
                      style={{ color: '#aa272f', textDecoration: 'underline', fontSize: '15px', display: 'inline-block' }}
                    >
                      View attachment {index + 1}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center' }}>
        <a 
          href={reviewUrl} 
          style={{ display: 'inline-block', backgroundColor: '#aa272f', color: '#ffffff', padding: '14px 28px', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }}
        >
          Review & Approve Request
        </a>
      </div>
    </div>
  );
};
