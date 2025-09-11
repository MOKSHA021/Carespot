const nodemailer = require('nodemailer');

// ✅ DEBUG: Log environment variables to verify they're loaded
console.log('🔍 Email Service Debug:');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM ? `✅ ${process.env.EMAIL_FROM}` : '❌ Missing');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? `✅ [${process.env.EMAIL_PASS.length} characters]` : '❌ Missing');
console.log('EMAIL_PASS (first 4 chars):', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.substring(0, 4) + '...' : 'Not found');

// ✅ FIXED: Explicit credential assignment with validation
const emailFrom = process.env.EMAIL_FROM;
const emailPass = process.env.EMAIL_PASS;

// Validate credentials before creating transporter
if (!emailFrom || !emailPass) {
  console.error('❌ CRITICAL: Missing email credentials!');
  console.error('EMAIL_FROM:', emailFrom || 'UNDEFINED');
  console.error('EMAIL_PASS:', emailPass ? 'EXISTS' : 'UNDEFINED');
  throw new Error('Email credentials not properly configured');
}

// ✅ FIXED: Direct credential assignment (not relying on process.env in transporter)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: emailFrom,     // ✅ Direct variable, not process.env
    pass: emailPass      // ✅ Direct variable, not process.env
  },
  tls: {
    rejectUnauthorized: false
  },
  debug: true,           // ✅ Enable detailed logging
  logger: true           // ✅ Enable transport logging
});

// Enhanced connection verification with detailed error reporting
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error.message);
    console.error('🔧 Debugging info:');
    console.error('   Host: smtp.gmail.com');
    console.error('   Port: 587');
    console.error('   User:', emailFrom);
    console.error('   Pass length:', emailPass ? emailPass.length : 'undefined');
    
    // Common error checks
    if (error.message.includes('Missing credentials')) {
      console.error('💡 Solution: Check that EMAIL_FROM and EMAIL_PASS are set correctly');
      console.error('💡 Verify no extra spaces or quotes in .env file');
    }
    if (error.message.includes('Invalid login')) {
      console.error('💡 Solution: Generate new Gmail App Password');
      console.error('💡 Ensure 2FA is enabled on Gmail account');
    }
  } else {
    console.log('✅ Email server ready to send messages');
    console.log(`📧 Configured for: ${emailFrom}`);
  }
});

// Email templates (keeping your existing ones)
const emailTemplates = {
  hospitalApproval: (data) => ({
    subject: `🎉 Hospital Application Approved - ${data.hospitalName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your hospital application has been approved</p>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 10px; border-left: 4px solid #10b981;">
          <h2 style="color: #1e293b; margin-top: 0;">Welcome to Carespot Healthcare Network!</h2>
          <p style="color: #475569; line-height: 1.6;">
            Dear ${data.hospitalName} Team,<br><br>
            We are pleased to inform you that your hospital partnership application has been <strong>approved</strong>! 
            You are now part of the Carespot healthcare network.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">📋 Next Steps:</h3>
            <ul style="color: #475569; line-height: 1.8;">
              <li>✅ Your hospital is now listed in our network</li>
              <li>📧 Manager account credentials will be sent separately</li>
              <li>🏥 Complete your hospital profile setup</li>
              <li>👨‍⚕️ Add your medical staff and schedules</li>
              <li>📅 Start receiving patient appointments</li>
            </ul>
          </div>
          
          ${data.verificationNotes ? 
            `<div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #0369a1; margin-top: 0;">📝 Admin Notes:</h4>
              <p style="color: #0369a1; margin: 0;">${data.verificationNotes}</p>
            </div>` : ''
          }
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" 
               style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              🚀 Access Hospital Dashboard
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">
            Welcome to the future of healthcare management!<br>
            <strong>Carespot Team</strong>
          </p>
        </div>
      </div>
    `
  }),

  hospitalRejection: (data) => ({
    subject: `Hospital Application Status Update - ${data.hospitalName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #ef4444; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📋 Application Update</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Regarding your hospital partnership application</p>
        </div>
        
        <div style="background: #fef2f2; padding: 25px; border-radius: 10px; border-left: 4px solid #ef4444;">
          <h2 style="color: #1e293b; margin-top: 0;">Application Under Review</h2>
          <p style="color: #475569; line-height: 1.6;">
            Dear ${data.hospitalName} Team,<br><br>
            Thank you for your interest in partnering with Carespot. After careful review, we need additional information before we can approve your application.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">📋 Required Actions:</h3>
            <p style="color: #475569; line-height: 1.6;">${data.rejectionReason}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/hospital-registration" 
               style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
               📝 Update Application
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">
            We're here to help you through this process!<br>
            <strong>Carespot Support Team</strong>
          </p>
        </div>
      </div>
    `
  }),

  managerWelcome: (data) => ({
    subject: `Welcome to Carespot - ${data.hospitalName} Manager Account Created`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">👋 Welcome to Carespot!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your hospital manager account is ready</p>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 10px; border-left: 4px solid #2563eb;">
          <h2 style="color: #1e293b; margin-top: 0;">🏥 Hospital Manager Account</h2>
          <p style="color: #475569; line-height: 1.6;">
            Dear ${data.name},<br><br>
            Your hospital manager account has been successfully created for <strong>${data.hospitalName}</strong>.
          </p>
          
          <div style="background: #1e293b; color: white; padding: 25px; border-radius: 10px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #ffffff;">🔐 Your Login Credentials:</h3>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${data.email}</p>
              <p style="margin: 5px 0;"><strong>🔑 Temporary Password:</strong> ${data.tempPassword}</p>
            </div>
            <div style="background: #ef4444; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <p style="margin: 0; font-size: 14px;">⚠️ <strong>Important:</strong> Please change your password immediately after first login.</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" 
               style="background: #2563eb; color: white; padding: 15px 40px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 16px;">
               🚀 Login to Dashboard
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 30px;">
            Thank you for joining the Carespot healthcare network!<br>
            <strong>Carespot Team</strong>
          </p>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const emailContent = emailTemplates[template](data);
    
    const mailOptions = {
      from: `"Carespot Healthcare" <${emailFrom}>`, // ✅ Using direct variable
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    console.log(`📤 Sending email to: ${to}`);
    console.log(`📧 From: ${emailFrom}`);
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`📧 Message ID: ${result.messageId}`);
    
    return {
      success: true,
      messageId: result.messageId
    };
    
  } catch (error) {
    console.error(`❌ Email sending failed to ${to}:`, error.message);
    
    return {
      success: false,
      error: error.message
    };
  }
};

// Enhanced test connection function
const testConnection = async () => {
  try {
    console.log('🧪 Testing SMTP connection...');
    console.log(`📧 User: ${emailFrom}`);
    console.log(`🔐 Pass: [${emailPass.length} characters] ${emailPass.substring(0, 4)}...`);
    
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    console.error('🔧 Current configuration:');
    console.error(`   EMAIL_FROM: ${emailFrom || 'MISSING'}`);
    console.error(`   EMAIL_PASS: ${emailPass ? 'SET (' + emailPass.length + ' chars)' : 'MISSING'}`);
    return false;
  }
};

// Send test email function  
const sendTestEmail = async (to) => {
  try {
    const testMailOptions = {
      from: `"Carespot Test" <${emailFrom}>`,
      to: to,
      subject: '✅ Carespot Email Test - Credentials Working!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">🎉 Email Authentication Fixed!</h2>
          <p><strong>✅ Your Gmail SMTP credentials are now working!</strong></p>
          <p>From: ${emailFrom}</p>
          <p>Timestamp: ${new Date().toLocaleString()}</p>
          <p style="color: #6b7280; font-size: 14px;">
            This confirms that the "Missing credentials for PLAIN" error has been resolved.
          </p>
        </div>
      `
    };

    const result = await transporter.sendMail(testMailOptions);
    console.log(`✅ Test email sent successfully to ${to}`);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error(`❌ Test email failed:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  testConnection,
  sendTestEmail,
  emailTemplates
};
