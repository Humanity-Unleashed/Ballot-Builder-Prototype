import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import logger from '@/server/utils/logger';

const globalForSheets = globalThis as unknown as {
  sheetsDoc: GoogleSpreadsheet | undefined;
};

function getDoc(): GoogleSpreadsheet | null {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!clientEmail || !privateKey || !spreadsheetId) {
    return null;
  }

  if (globalForSheets.sheetsDoc) {
    return globalForSheets.sheetsDoc;
  }

  const auth = new JWT({
    email: clientEmail,
    key: privateKey.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(spreadsheetId, auth);

  if (process.env.NODE_ENV !== 'production') {
    globalForSheets.sheetsDoc = doc;
  }

  return doc;
}

interface FeedbackRow {
  id: string;
  screen: string;
  screenName: string;
  type: string | null;
  message: string;
  createdAt: string;
}

export async function appendFeedbackRow(row: FeedbackRow): Promise<void> {
  const doc = getDoc();
  if (!doc) return;

  try {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow({
      Id: row.id,
      Screen: row.screen,
      'Screen Name': row.screenName,
      Type: row.type ?? '',
      Message: row.message,
      'Created At': row.createdAt,
    });
    logger.info('Feedback row appended to Google Sheet', { id: row.id });
  } catch (error) {
    logger.error('Failed to append feedback to Google Sheet', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
