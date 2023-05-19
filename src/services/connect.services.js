import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { gmailAcc, outlookAcc } from '../accounts.js';
import { Readable } from 'stream';
import fs from 'fs';
import { database } from '../database/database.js';

const date = new Date('May 25, 2018');

export const connectEmail = async (email, password, host, cbfn) => {
  const userInfo = {
    user: email,
    password,
    host,
    port: 993,
    tls: true,
  };

  //todo separate this into a middleware if it gets bigger
  const isGmailAccount = host.includes('gmail');
  if (isGmailAccount) userInfo.tlsOptions = { servername: 'imap.gmail.com' };

  const emails = [];

  const imap = new Imap(userInfo);

  return new Promise((resolve, reject) => {
    imap.once('ready', async () => {
      imap.openBox('INBOX', false, async () => {
        imap.search(['UNSEEN', ['SINCE', new Date()]], async (err, results) => {
          try {
            const f = imap.fetch(results, { bodies: '' });
            f.on('message', async (msg) => {
              msg.on('body', async (stream) => {
                simpleParser(stream, async (err, parsed) => {
                  const { from, subject, textAsHtml, text, date } = parsed;
                  const emailObj = {
                    title: from.text,
                    subject,
                    date: date.toLocaleString(),
                  };
                  emails.push(emailObj);
                });
              });
              msg.once('attributes', (attrs) => {
                const { uid } = attrs;
                imap.addFlags(uid, ['\\Seen'], () => {
                  console.log('Marked as read!');
                });
              });
            });
            f.on('error', (ex) => {
              reject(ex);
            });
            f.once('end', () => {
              console.log('Done fetching all messages!');
              imap.end();
            });
          } catch (error) {
            reject(error);
          }
        });
      });
    });

    imap.once('error', (err) => {
      console.log(err);
      reject(err);
    });

    imap.once('end', () => {
      console.log('Connection ended');
      resolve(cbfn(emails));
    });

    imap.connect();
  });
};
