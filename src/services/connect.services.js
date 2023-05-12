import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { gmailAcc, outlookAcc } from '../middlewares/accounts.js';

export const connectEmail = (email, password, host, cbfn) => {
  const userInfo = {
    user: email,
    password,
    host,
    port: 993,
    tls: true,
  };

  //todo separate this into a middleware if it gets bigger
  const gmailAccount = host.contains('gmail');
  if (gmailAccount) userInfo.tlsOptions = { servername: 'imap.gmail.com' };

  try {
    const imap = new Imap(userInfo);
    imap.once('ready', () => {
      imap.openBox('INBOX', false, () => {
        imap.search(['SEEN', ['SINCE', now]], (err, results) => {
          const f = imap.fetch(results, { bodies: '' });
          f.on('message', (msg) => {
            msg.on('body', (stream) => {
              simpleParser(stream, async (err, parsed) => {
                const { from, subject, textAsHtml, text, date } = parsed;
                const emailObj = {
                  from,
                  title,
                  subject,
                  text,
                  textAsHtml,
                };

                cbfn(emailObj);
                console.log(date.toLocaleString(), formattedMsg.title);
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
    });

    imap.connect();
  } catch (ex) {
    console.log('an error occurred', ex);
  }
};
