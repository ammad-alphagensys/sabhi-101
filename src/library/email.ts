import nodemailer from 'nodemailer';
import pug from 'pug';
import htmlToText from 'html-to-text';
import type { IUser } from '@/type';

export class Email {
  private to: string;
  private firstName: string;
  private from: string;

  constructor(user: IUser) {
    this.to = user.email!;
    this.firstName = user.full_name!.split(' ')[0]!;
    this.from = `Sabhi <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        service: 'Mailchimp',
        auth: {
          user: process.env.MAILCHIMP_USERNAME,
          pass: process.env.MAILCHIMP_PASSWORD
        }
      });
    }
    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD
      }
    });
  }

  // Send the actual email
  async send(template, subject, payload) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../../views/${template}.pug`, {
      firstName: this.firstName || 'Dummy',
      subject,
      ...payload
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html)
    };
    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome_sabhi', 'Welcome to the Sabhi !');
  }

  async sendConnectGoogle() {
    await this.send('connect_google_review', 'Connect Your Google Account to Sabhi', { url: 'https://platform.sabhi.io/dashboard/business-admin/review' });
  }

  async sendFirstPaymentLink() {
    await this.send('first_payment_link', 'First Payment Link Created Successfully', { url: 'https://platform.sabhi.io/dashboard/business-admin/messaging' });
  }

  async sendMessagingBasic() {
    await this.send('messaging_basic', 'Get Started with Sabhi Messaging', { url: 'https://platform.sabhi.io/dashboard/business-admin/messaging' });
  }

  async sendSetupAccount() {
    await this.send('setup_account', 'Set Up Your Sabhi Account', { url: 'https://platform.sabhi.io/dashboard/business-admin/sales-clerk' });
  }

  async sendReport() {
    await this.send('reporting', 'Your Sabhi Report', { url: 'https://platform.sabhi.io/dashboard/business-admin/report' });
  }

  async sendPasswordReset() {
    await this.send('password_reset', 'Your password reset token');
  }

  async sendGetPaidFaster() {
    await this.send('get_paid_faster', 'Get Paid Faster with Sabhi Invoices');
  }

  async sendMasterMessaging() {
    await this.send('master_messaging', 'Enhance Customer Communication with Sabhi Master Messaging');
  }

  // sendOneStepFromFinishing
  async sendOneStepFromFinishing() {
    await this.send('one_step_from_finishing', 'You are One Step Away from Launching Your Business with Sabhi');
  }
  // shortOnTime
  async sendShortOnTime() {
    await this.send('short_on_time', 'Short on Time? Let Sabhi Help You Launch Your Business Quickly');
  }
  // threeQuickSteps
  async sendThreeQuickSteps() {
    await this.send('three_quick_steps', 'Just Three Quick Steps to Get Your Business Started with Sabhi');
  }
  // trackOrder
  async sendTrackOrder() {
    await this.send('track_order', 'Track Your Sabhi Order Easily');
  }
  // turnOnGoogleReviews
  async sendTurnOnGoogleReviews() {
    await this.send('turn_on_google_reviews', 'Boost Your Business Reputation with Sabhi Google Reviews');
  }
  // unlockSabhi
  async unlockSabhi() {
    await this.send('unlock_sabhi', 'Unlock the Full Potential of Sabhi for Your Business');
  }

  // week_at_glance
  async sendWeekAtGlance() {
    await this.send('week_at_glance', 'Your Week at a Glance with Sabhi');
  }
};
