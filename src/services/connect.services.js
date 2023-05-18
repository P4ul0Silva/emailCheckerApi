import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { gmailAcc, outlookAcc } from '../accounts.js';
import { Readable } from 'stream';
import fs from 'fs';
import { database } from '../database/database.js';

const date = new Date(2023, 4, 4);

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

  const imap = new Imap(userInfo);
  imap.once('ready', async () => {
    imap.openBox('INBOX', false, async () => {
      imap.search(['SEEN', ['SINCE', date]], async (err, results) => {
        const f = imap.fetch(results, { bodies: '' });
        f.on('message', async (msg) => {
          msg.on('body', async (stream) => {
            simpleParser(stream, { formatDateString: true }, async (err, parsed) => {
              const { from, subject, textAsHtml, text, date } = parsed;
              const emailObj = {
                title: from.text,
                subject,
                // criar um obj menor com o 'text' formatado
                date,
              };
              // transform obj to readable stream
              const readableStreamObj = Readable.from([JSON.stringify(emailObj)]);
              for await (const email of readableStreamObj) {
                database.push(email);
              }
              cbfn(database);
              // readableStreamObj.on('data', (email) => {
              //   database.push(email);
              //   // console.log(database);
              // });
            });
          });
          msg.once('attributes', (attrs) => {
            const { uid } = attrs;
            imap.addFlags(uid, ['\\Seen'], () => {
              // Mark the email as read after reading it
              console.log('Marked as read!');
            });
          });
        });
        f.once('error', (ex) => {
          return Promise.reject(ex);
        });
        f.once('end', () => {
          console.log('Done fetching all messages!');
          imap.end();
        });
      });
    });
  });

  imap.once('error', (err) => {
    console.log(err);
  });

  imap.once('end', () => {
    console.log('Connection ended');
    console.log(`Tamanho do array é ${database.length}`);
  });

  imap.connect();
};
