/**
 * @format
 */

import SES from 'aws-sdk/clients/ses';
import Email from 'email-templates';
import { EmailTemplatesPath, dev } from '../config';

const fromEmail = 'noreply@Tests.com';

export const sendEmail = async (to: string, subject: string, body: string) => {
  var params = {
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromEmail
  };

  // Create the promise and SES service object
  var sendPromise = new SES({ apiVersion: '2010-12-01' })
    .sendEmail(params)
    .promise();
  const sendRes = await sendPromise;

  return sendRes;
};

export const getEmailTemplateGenerator = async () => {
  const email = new Email({
    message: {},
    juiceResources: {
      webResources: {
        relativeTo: EmailTemplatesPath
      }
    }
  });
  return email;
};

export const sendEmailTemplate = async (
  to: string,
  subject: string,
  template: string,
  params: any
) => {
  const email = await getEmailTemplateGenerator();
  const body = await email.render(template, params);

  /**
   * Don't send emails in development. Automatically preview emails in the
   * browser instead: https://www.npmjs.com/package/email-templates#preview
   */
  if (dev) {
    return await email.send({
      message: {
        from: fromEmail,
        to,
        subject,
        html: body
      },
      template: template,
      locals: {}
    });
  }

  return await sendEmail(to, subject, body);
};
