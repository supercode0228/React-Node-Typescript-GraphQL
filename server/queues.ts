/**
 * @format
 */

// @ts-ignore
import ActiveCampaign from 'activecampaign';
import Queue from 'bull';
import {
  ACTIVECAMPAIGN_ACCOUNT,
  ACTIVECAMPAIGN_KEY,
  ACTIVECAMPAIGN_TRACK_ACTID,
  ACTIVECAMPAIGN_TRACK_KEY,
  redisURL
} from './config';

const activecampaign = new ActiveCampaign(
  `https://${ACTIVECAMPAIGN_ACCOUNT}.api-us1.com`,
  ACTIVECAMPAIGN_KEY
);

export const syncActiveCampaignContactQueue = new Queue(
  'sync ActiveCampaign contact',
  redisURL
);

syncActiveCampaignContactQueue.process(
  async (job: Queue.Job, done: Queue.DoneCallback) => {
    const user = job.data.user;

    var firstName = '';
    var lastName = '';

    if (user.name) {
      const name = user.name.split(' ');
      firstName = name[0];

      if (name.length > 1) {
        lastName = name[name.length - 1];
      }
    }

    const viewContact = activecampaign.api(
      `contact/view?email=${user.login}`,
      {}
    );

    viewContact.then(
      (result: any) => {
        var params = {
          email: user.login,
          first_name: firstName,
          last_name: lastName,
          'field[%DEPARTMENT%,0]': user.skillArea ? `${user.skillArea}` : ''
        };

        if (result.result_code === 1) {
          // Add required params for edit
          Object.assign(params, {
            id: result.id,
            overwrite: 0 // only update included post parameters
          });

          // Update subscriptions when contact accepts marketing.
          // Set status from the existing list (if it exists) to make
          // sure we don't re-subscribe contact that has unsubscribed.
          if (user.joinedMailingList) {
            Object.assign(params, {
              'p[2]': 2, // Webinars & Events
              'p[5]': 5, // Monthly Newsletter
              'status[2]': result.lists['2']?.status || 1,
              'status[5]': result.lists['5']?.status || 1
            });
          }

          const editContact = activecampaign.api('contact/edit', params);
          editContact.then(
            (result: any) => {
              console.log(result.result_message);
            },
            (error: any) => {
              console.error(error);

              done(new Error(error));
            }
          );
        } else {
          // Subscribe to default mailing lists for new contact
          Object.assign(params, {
            'p[1]': 1, // Get Started with Tests
            'p[3]': 3, // Product Announcements
            'p[6]': 6, // Giveaways & Goodies
            'p[7]': 7 // Tips & Tricks
          });

          const addContact = activecampaign.api('contact/add', params);
          addContact.then(
            (result: any) => {
              console.log(result.result_message);

              // Track user sign up event
              trackActiveCampaignEventQueue.add({
                email: user.login,
                event: 'user signed up'
              });
            },
            (error: any) => {
              console.error(error);

              done(new Error(error));
            }
          );
        }
      },
      (error: any) => {
        console.error(error);

        done(new Error(error));
      }
    );

    done();
  }
);

export const deleteActiveCampaignContactQueue = new Queue(
  'delete ActiveCampaign contact',
  redisURL
);

deleteActiveCampaignContactQueue.process(
  async (job: Queue.Job, done: Queue.DoneCallback) => {
    const user = job.data.user;

    const viewContact = activecampaign.api(
      `contact/view?email=${user.login}`,
      {}
    );

    viewContact.then(
      (result: any) => {
        if (result.result_code === 1) {
          const deleteContact = activecampaign.api('contact/delete', {
            id: result.id
          });

          deleteContact.then(
            (result: any) => {
              console.log(result.result_message);
            },
            (error: any) => {
              console.error(error);

              done(new Error(error));
            }
          );
        } else {
          console.log(result.result_message);
        }
      },
      (error: any) => {
        console.error(error);

        done(new Error(error));
      }
    );

    done();
  }
);

export const trackActiveCampaignEventQueue = new Queue(
  'track ActiveCampaign event',
  redisURL
);

trackActiveCampaignEventQueue.process(
  async (job: Queue.Job, done: Queue.DoneCallback) => {
    const email = job.data.email;
    const event = job.data.event;

    activecampaign.track_actid = ACTIVECAMPAIGN_TRACK_ACTID;
    activecampaign.track_key = ACTIVECAMPAIGN_TRACK_KEY;
    activecampaign.track_email = email;

    const logTracking = activecampaign.api('tracking/log', { event: event });
    logTracking.then(
      (result: any) => {
        console.log(result.message);
      },
      (error: any) => {
        console.error(error);

        done(new Error(error));
      }
    );

    done();
  }
);
